import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    outletId: string,
    page: number,
    limit: number,
  ) {
    const where: Prisma.CategoryWhereInput = {
      outlet: { tenantId },
      outletId,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(
    tenantId: string,
    dto: { name: string; nameHi?: string; sortOrder?: number; outletId: string },
  ) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: dto.outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    const existing = await this.prisma.category.findFirst({
      where: {
        outletId: dto.outletId,
        name: dto.name,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    return this.prisma.category.create({ data: dto });
  }

  async update(
    tenantId: string,
    id: string,
    dto: { name?: string; nameHi?: string; sortOrder?: number },
  ) {
    const category = await this.prisma.category.findFirst({
      where: { id, outlet: { tenantId }, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async softDelete(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, outlet: { tenantId }, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');

    // Check if category has active products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing products. Remove products first.',
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
