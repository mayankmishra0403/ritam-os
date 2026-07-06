import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OutletsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.outlet.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tables: true, categories: true, orders: true } },
      },
    });
  }

  async create(
    tenantId: string,
    dto: {
      name: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      phone?: string;
      gstin?: string;
      fssai?: string;
    },
  ) {
    const existing = await this.prisma.outlet.findFirst({
      where: { tenantId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException('Outlet with this name already exists');
    }

    return this.prisma.outlet.create({
      data: { ...dto, tenantId },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: {
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      phone?: string;
      gstin?: string;
      fssai?: string;
    },
  ) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    return this.prisma.outlet.update({ where: { id }, data: dto });
  }

  async updateSettings(
    tenantId: string,
    id: string,
    settings: Record<string, any>,
  ) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    // Merge existing settings with new ones
    const currentSettings =
      (outlet as any).settings || ({} as Record<string, any>);

    // Since Outlet schema doesn't have a settings field, we use the tenant's settings for now
    // Or we can store per-outlet settings in the tenant's settings JSON
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const tenantSettings =
      (tenant.settings as Record<string, any>) || ({} as Record<string, any>);
    const outletSettings =
      tenantSettings[`outlet_${id}`] ||
      ({} as Record<string, any>);

    const merged = { ...outletSettings, ...settings };
    const updatedTenantSettings = {
      ...tenantSettings,
      [`outlet_${id}`]: merged,
    };

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: updatedTenantSettings },
    });

    return { id, settings: merged };
  }
}
