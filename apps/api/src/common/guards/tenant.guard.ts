import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SKIP_TENANT_GUARD = 'skipTenantGuard';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipGuard = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipGuard) return true;

    const request = context.switchToHttp().getRequest();
    if (!request.user?.tenantId) return false;
    request.tenantId = request.user.tenantId;
    return true;
  }
}
