import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TablesModule } from './modules/tables/tables.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReportsModule } from './modules/reports/reports.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { StaffModule } from './modules/staff/staff.module';
import { AggregatorModule } from './modules/aggregator/aggregator.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { TenantGuard } from './common/guards/tenant.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TablesModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    ReportsModule,
    OutletsModule,
    StaffModule,
    AggregatorModule,
    WhatsappModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
export class AppModule {}
