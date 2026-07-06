import { SetMetadata } from '@nestjs/common';
import { SKIP_TENANT_GUARD } from './tenant.guard';

export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_GUARD, true);
