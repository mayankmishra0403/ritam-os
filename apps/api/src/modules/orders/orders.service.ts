import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderGateway } from '../../common/gateways/order.gateway';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGateway: OrderGateway,
  ) {}

  async findAll(
    tenantId: string,
    filters: {
      outletId: string;
      status?: string;
      tableId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    page: number,
    limit: number,
  ) {
    const where: Prisma.OrderWhereInput = {
      outlet: { tenantId },
      outletId: filters.outletId,
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status as any;
    if (filters.tableId) where.tableId = filters.tableId;

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as any).gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        (where.createdAt as any).lte = new Date(filters.dateTo);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          table: { select: { id: true, tableNumber: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
          payments: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, outlet: { tenantId }, deletedAt: null },
      include: {
        table: { select: { id: true, tableNumber: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { paidAt: 'asc' },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(
    tenantId: string,
    dto: {
      outletId: string;
      tableId?: string;
      source?: string;
      customerName?: string;
      customerPhone?: string;
      notes?: string;
      items: Array<{
        productId: string;
        quantity: number;
        modifierIds?: string[];
        notes?: string;
      }>;
    },
  ) {
    // Verify outlet
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: dto.outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    // Verify table if provided
    if (dto.tableId) {
      const table = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          outletId: dto.outletId,
          deletedAt: null,
        },
      });
      if (!table) throw new NotFoundException('Table not found');
    }

    // Validate and calculate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, outletId: dto.outletId, deletedAt: null },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItemsData = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        modifierIds: item.modifierIds || [],
        notes: item.notes,
        status: 'PENDING',
      };
    });

    const grandTotal = subtotal; // No tax/discount for now — could be added later

    // Create order with items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          outletId: dto.outletId,
          tableId: dto.tableId || null,
          source: (dto.source as any) || 'POS',
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          notes: dto.notes,
          subtotal,
          taxTotal: 0,
          discountTotal: 0,
          grandTotal,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          table: { select: { id: true, tableNumber: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
          payments: true,
        },
      });

      // Update table status to OCCUPIED
      if (dto.tableId) {
        await tx.table.update({
          where: { id: dto.tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      return newOrder;
    });

    // Emit WebSocket events
    this.orderGateway.emitOrderCreated(order);
    if (dto.tableId) {
      this.orderGateway.emitTableStatusUpdated({
        id: dto.tableId,
        status: 'OCCUPIED',
      });
    }

    return order;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED',
  ) {
    const order = await this.findOne(tenantId, id);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        table: { select: { id: true, tableNumber: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
        payments: true,
      },
    });

    // If PAID or CANCELLED, free the table
    if ((status === 'PAID' || status === 'CANCELLED') && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'FREE' },
      });
      this.orderGateway.emitTableStatusUpdated({
        id: order.tableId,
        status: 'FREE',
      });
    }

    this.orderGateway.emitOrderStatusUpdated(updated);
    return updated;
  }

  async updateItemStatus(
    tenantId: string,
    orderId: string,
    itemId: string,
    status: string,
  ) {
    await this.findOne(tenantId, orderId);

    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (!item) throw new NotFoundException('Order item not found');

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    this.orderGateway.emitItemStatusUpdated(updated);
    return updated;
  }

  async addPayment(
    tenantId: string,
    id: string,
    dto: {
      amount: number;
      method: 'CASH' | 'UPI' | 'CARD' | 'SPLIT';
      gatewayReference?: string;
      gatewayStatus?: string;
    },
  ) {
    const order = await this.findOne(tenantId, id);

    // Validate payment amount doesn't exceed remaining
    const totalPaid = order.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const remaining = Number(order.grandTotal) - totalPaid;
    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Payment amount ${dto.amount} exceeds remaining balance ${remaining}`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: id,
        amount: dto.amount,
        method: dto.method,
        gatewayReference: dto.gatewayReference,
        gatewayStatus: dto.gatewayStatus,
      },
    });

    // Check if order is fully paid
    const newTotalPaid = totalPaid + dto.amount;
    if (newTotalPaid >= Number(order.grandTotal)) {
      await this.prisma.order.update({
        where: { id },
        data: { status: 'PAID', paymentStatus: 'PAID' },
      });

      if (order.tableId) {
        await this.prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'FREE' },
        });
        this.orderGateway.emitTableStatusUpdated({
          id: order.tableId,
          status: 'FREE',
        });
      }

      const updatedOrder = await this.findOne(tenantId, id);
      this.orderGateway.emitOrderStatusUpdated(updatedOrder);
    }

    return payment;
  }
}
