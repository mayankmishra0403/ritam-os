import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderGateway } from '../../common/gateways/order.gateway';
import { Prisma } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGateway: OrderGateway,
  ) {}

  async findAll(
    tenantId: string,
    outletId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.TableWhereInput = {
      outlet: { tenantId },
      outletId,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.table.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tableNumber: 'asc' },
      }),
      this.prisma.table.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const table = await this.prisma.table.findFirst({
      where: { id, outlet: { tenantId }, deletedAt: null },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async create(
    tenantId: string,
    dto: {
      tableNumber: number;
      capacity: number;
      section?: string;
      outletId: string;
    },
  ) {
    // Verify outlet belongs to tenant
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: dto.outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    const existing = await this.prisma.table.findFirst({
      where: {
        outletId: dto.outletId,
        tableNumber: dto.tableNumber,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Table ${dto.tableNumber} already exists in this outlet`,
      );
    }

    return this.prisma.table.create({ data: dto });
  }

  async update(
    tenantId: string,
    id: string,
    dto: { tableNumber?: number; capacity?: number; section?: string },
  ) {
    await this.findOne(tenantId, id);

    if (dto.tableNumber) {
      const existing = await this.prisma.table.findFirst({
        where: {
          outlet: { tenantId },
          tableNumber: dto.tableNumber,
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Table ${dto.tableNumber} already exists`,
        );
      }
    }

    return this.prisma.table.update({ where: { id }, data: dto });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: 'FREE' | 'OCCUPIED' | 'BILLING' | 'RESERVED',
  ) {
    await this.findOne(tenantId, id);
    const table = await this.prisma.table.update({
      where: { id },
      data: { status },
    });
    this.orderGateway.emitTableStatusUpdated(table);
    return table;
  }

  async softDelete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.table.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
