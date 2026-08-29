import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOrigin = rawCorsOrigin.includes(',')
  ? rawCorsOrigin.split(',').map((o) => o.trim())
  : rawCorsOrigin;

@WebSocketGateway({
  cors: { origin: corsOrigin, credentials: true },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    // Register this gateway in the service to break the circular dependency
    this.notificationsService.setGateway(this);
    this.logger.log('NotificationsGateway registered with NotificationsService');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      if (!userId) {
        client.disconnect();
        return;
      }

      (client as any).userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      client.join(`user:${userId}`);

      const count = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', count);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;
    await this.notificationsService.markRead(data.id, userId);
    const count = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('unread-count', count);
  }

  @SubscribeMessage('mark-all-read')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    const userId = (client as any).userId;
    if (!userId) return;
    await this.notificationsService.markAllRead(userId);
    this.server.to(`user:${userId}`).emit('unread-count', 0);
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    // Update unread count asynchronously
    this.notificationsService.getUnreadCount(userId).then((count) => {
      this.server.to(`user:${userId}`).emit('unread-count', count);
    }).catch(() => {});
  }

  broadcastToAll(notification: any) {
    this.server.emit('notification', notification);
  }
}
