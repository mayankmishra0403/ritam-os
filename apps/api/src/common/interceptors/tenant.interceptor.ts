import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

export const SKIP_TENANT_INTERCEPTOR = 'skipTenantInterceptor';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_INTERCEPTOR, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return next.handle();

    const request = context.switchToHttp().getRequest();
    if (request.user) {
      if (!request.user.tenantId) {
        throw new ForbiddenException();
      }
      request.tenantId = request.user.tenantId;
    }
    return next.handle();
  }
}
