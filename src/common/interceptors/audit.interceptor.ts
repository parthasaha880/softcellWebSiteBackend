import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const user = request.user;
      const action = `${method} ${request.route?.path || request.url}`;

      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.prisma.auditLog.create({
              data: {
                userId: user?.id,
                action,
                entity: context.getClass().name,
                entityId: request.params?.id,
                newData: method !== 'DELETE' ? data : undefined,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
              },
            });
          } catch {
            // Silently fail audit logging
          }
        }),
      );
    }

    return next.handle();
  }
}
