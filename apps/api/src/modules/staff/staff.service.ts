import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, outletId?: string) {
    // Staff are users belonging to this tenant
    // If outletId is provided, we filter by staff assigned to that outlet
    // Since User model doesn't have outletId, we return all tenant users
    const where: any = { tenantId, deletedAt: null };

    return this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async create(
    tenantId: string,
    dto: {
      name: string;
      phone: string;
      email?: string;
      role: string;
      pin: string;
    },
  ) {
    // Check for existing user with same phone in tenant
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        OR: [
          { phone: dto.phone },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException(
        'Staff with this phone or email already exists',
      );
    }

    // Hash the PIN as password (staff login via PIN)
    const passwordHash = await bcrypt.hash(dto.pin, 12);

    const validRoles = ['MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'];
    if (!validRoles.includes(dto.role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      );
    }

    return this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email || null,
        passwordHash,
        role: dto.role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: {
      name?: string;
      phone?: string;
      email?: string;
      role?: string;
      pin?: string;
      isActive?: boolean;
    },
  ) {
    const staff = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.role !== undefined) {
      const validRoles = ['MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'];
      if (!validRoles.includes(dto.role)) {
        throw new BadRequestException(
          `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        );
      }
      data.role = dto.role;
    }

    if (dto.pin !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.pin, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async softDelete(tenantId: string, id: string) {
    const staff = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
