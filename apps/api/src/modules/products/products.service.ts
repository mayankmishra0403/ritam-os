import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: {
      outletId: string;
      categoryId?: string;
      isActive?: boolean;
      search?: string;
    },
    page: number,
    limit: number,
  ) {
    const where: Prisma.ProductWhereInput = {
      outlet: { tenantId },
      outletId: filters.outletId,
      deletedAt: null,
    };

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nameHi: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          category: { select: { id: true, name: true } },
          modifiers: {
            include: { modifier: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, outlet: { tenantId }, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        modifiers: {
          include: { modifier: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(
    tenantId: string,
    dto: {
      name: string;
      nameHi?: string;
      price: number;
      description?: string;
      descriptionHi?: string;
      imageUrl?: string;
      sortOrder?: number;
      outletId: string;
      categoryId: string;
      modifierIds?: string[];
    },
  ) {
    // Verify outlet and category
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: dto.outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, outletId: dto.outletId, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');

    // Verify modifiers if provided
    if (dto.modifierIds?.length) {
      const modifiers = await this.prisma.modifier.findMany({
        where: { id: { in: dto.modifierIds }, deletedAt: null },
      });
      if (modifiers.length !== dto.modifierIds.length) {
        throw new BadRequestException('One or more modifiers not found');
      }
    }

    const { modifierIds, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        price: dto.price,
        modifiers: modifierIds?.length
          ? {
              create: modifierIds.map((modifierId) => ({
                modifier: { connect: { id: modifierId } },
              })),
            }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        modifiers: { include: { modifier: true } },
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: {
      name?: string;
      nameHi?: string;
      price?: number;
      description?: string;
      descriptionHi?: string;
      imageUrl?: string;
      sortOrder?: number;
      categoryId?: string;
      modifierIds?: string[];
    },
  ) {
    await this.findOne(tenantId, id);

    const { modifierIds, ...updateData } = dto;

    // If modifierIds provided, replace all associations
    if (modifierIds !== undefined) {
      // Verify modifiers exist
      if (modifierIds.length > 0) {
        const modifiers = await this.prisma.modifier.findMany({
          where: { id: { in: modifierIds }, deletedAt: null },
        });
        if (modifiers.length !== modifierIds.length) {
          throw new BadRequestException('One or more modifiers not found');
        }
      }

      // Delete existing associations and create new ones
      await this.prisma.productModifier.deleteMany({
        where: { productId: id },
      });

      if (modifierIds.length > 0) {
        await this.prisma.productModifier.createMany({
          data: modifierIds.map((modifierId) => ({
            productId: id,
            modifierId,
          })),
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        modifiers: { include: { modifier: true } },
      },
    });
  }

  async toggleActive(tenantId: string, id: string) {
    const product = await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        category: { select: { id: true, name: true } },
        modifiers: { include: { modifier: true } },
      },
    });
  }

  async softDelete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
