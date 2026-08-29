import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  // Set by the gateway via onModuleInit — avoids circular dep
  private gateway: { sendNotification(userId: string, n: any): void } | null = null;

  constructor(private prisma: PrismaService) {}

  setGateway(gateway: { sendNotification(userId: string, n: any): void }) {
    this.gateway = gateway;
  }

  async findByUser(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    return this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async create(data: { userId: string; type: string; title: string; message: string; link?: string; metadata?: any }) {
    const { metadata, ...rest } = data;
    const notification = await this.prisma.notification.create({
      data: { ...rest, ...(metadata ? { data: metadata } : {}) } as any,
    });
    // Push real-time via WebSocket
    this.gateway?.sendNotification(notification.userId, notification);
    return notification;
  }

  async notifyAdmins(data: { type: string; title: string; message: string; link?: string; metadata?: any }) {
    const { metadata, ...rest } = data;
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['SUPERADMIN', 'ADMIN', 'MANAGER'] as any[] } },
      select: { id: true },
    });
    const notifications = await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: { userId: admin.id, ...rest, ...(metadata ? { data: metadata } : {}) } as any,
        }),
      ),
    );
    // Push real-time via WebSocket to each admin
    notifications.forEach((n) => {
      this.gateway?.sendNotification(n.userId, n);
    });
    return notifications;
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async remove(id: string, userId: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } });
    return { message: 'Notification deleted' };
  }
}
