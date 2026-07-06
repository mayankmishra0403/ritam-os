import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesSummary(
    tenantId: string,
    outletId: string,
    from: string,
    to: string,
  ) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    const where: Prisma.OrderWhereInput = {
      outletId,
      deletedAt: null,
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    };

    const [orders, aggregation] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: { id: true, grandTotal: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.aggregate({
        where,
        _sum: { grandTotal: true },
        _count: true,
        _avg: { grandTotal: true },
      }),
    ]);

    const totalOrders = aggregation._count;
    const totalRevenue = Number(aggregation._sum.grandTotal || 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count by status
    const statusBreakdown = orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      from,
      to,
      totalOrders,
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      statusBreakdown,
    };
  }

  async getTopItems(
    tenantId: string,
    outletId: string,
    from: string,
    to: string,
  ) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          outletId,
          deletedAt: null,
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
      },
      include: {
        product: { select: { id: true, name: true, price: true } },
      },
    });

    // Aggregate by product
    const itemMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        totalQuantity: number;
        totalRevenue: number;
      }
    >();

    for (const item of orderItems) {
      const key = item.productId;
      const existing = itemMap.get(key);
      const revenue = Number(item.unitPrice) * item.quantity;

      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += revenue;
      } else {
        itemMap.set(key, {
          productId: item.product.id,
          productName: item.product.name,
          totalQuantity: item.quantity,
          totalRevenue: revenue,
        });
      }
    }

    const items = Array.from(itemMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 20);

    return { from, to, items };
  }

  async getPaymentMethodBreakdown(
    tenantId: string,
    outletId: string,
    from: string,
    to: string,
  ) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: outletId, tenantId, deletedAt: null },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');

    const payments = await this.prisma.payment.findMany({
      where: {
        order: {
          outletId,
          deletedAt: null,
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
      },
    });

    const methodMap = new Map<string, { count: number; total: number }>();

    for (const payment of payments) {
      const method = payment.method;
      const existing = methodMap.get(method);
      const amount = Number(payment.amount);

      if (existing) {
        existing.count += 1;
        existing.total += amount;
      } else {
        methodMap.set(method, { count: 1, total: amount });
      }
    }

    const breakdown = Array.from(methodMap.entries()).map(
      ([method, data]) => ({
        method,
        transactionCount: data.count,
        totalAmount: Math.round(data.total * 100) / 100,
      }),
    );

    const grandTotal = breakdown.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      from,
      to,
      breakdown,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }
}
