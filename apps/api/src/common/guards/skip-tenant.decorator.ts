import { SetMetadata } from '@nestjs/common';
import { SKIP_TENANT_INTERCEPTOR } from '../interceptors/tenant.interceptor';

export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_INTERCEPTOR, true);
