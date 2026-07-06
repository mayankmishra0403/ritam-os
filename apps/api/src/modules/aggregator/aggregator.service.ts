import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  AggregatorPlatform,
  AggregatorConfig,
  AggregatorOrderStatus,
  InternalAggregatorOrder,
  SwiggyWebhookPayload,
  ZomatoWebhookPayload,
  AggregatorStatusUpdate,
} from './interfaces/aggregator.interface';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  /**
   * In-memory store for aggregator configurations per outlet per platform.
   * In production, this would be stored in the database (Tenant settings JSON or a dedicated table).
   */
  private configStore: Map<string, AggregatorConfig> = new Map();

  /**
   * In-memory store for received aggregator orders.
   * In production, these would be persisted in the orders table with a source flag.
   */
  private orderStore: Map<string, InternalAggregatorOrder> = new Map();

  private readonly configKey = (outletId: string, platform: string): string =>
    `${outletId}:${platform}`;

  // ──────────────────────────────────────────────
  //  Configuration Management
  // ──────────────────────────────────────────────

  configure(
    outletId: string,
    platform: AggregatorPlatform,
    config: Omit<AggregatorConfig, 'outletId' | 'platform'>,
  ): AggregatorConfig {
    const fullConfig: AggregatorConfig = {
      outletId,
      platform,
      ...config,
      isActive: config.isActive ?? true,
      autoAccept: config.autoAccept ?? false,
    };

    const key = this.configKey(outletId, platform);
    this.configStore.set(key, fullConfig);

    this.logger.log(`Aggregator configured: outlet=${outletId} platform=${platform}`);
    return fullConfig;
  }

  getConfig(outletId: string, platform: AggregatorPlatform): AggregatorConfig | null {
    const key = this.configKey(outletId, platform);
    return this.configStore.get(key) ?? null;
  }

  getAllConfigs(outletId: string): AggregatorConfig[] {
    const results: AggregatorConfig[] = [];
    for (const [key, config] of this.configStore.entries()) {
      if (key.startsWith(`${outletId}:`)) {
        results.push(config);
      }
    }
    return results;
  }

  // ──────────────────────────────────────────────
  //  Webhook Handlers
  // ──────────────────────────────────────────────

  handleSwiggyWebhook(payload: SwiggyWebhookPayload): InternalAggregatorOrder {
    this.logger.log(`Swiggy webhook received: order=${payload.order_id}`);

    if (!payload.order_id || !payload.restaurant_id) {
      throw new BadRequestException('Invalid Swiggy webhook payload: missing order_id or restaurant_id');
    }

    // Validate required fields
    if (!payload.order_details?.items?.length) {
      throw new BadRequestException('Invalid Swiggy webhook payload: order has no items');
    }

    const order: InternalAggregatorOrder = {
      id: `agg-swiggy-${payload.order_id}-${Date.now()}`,
      platform: 'SWIGGY',
      platformOrderId: payload.order_id,
      restaurantId: payload.restaurant_id,
      items: payload.order_details.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers || [],
      })),
      total: payload.order_details.total,
      paymentMethod: payload.order_details.payment_method,
      customer: {
        name: payload.customer.name,
        phone: payload.customer.phone,
        address: payload.customer.address,
      },
      status: 'PENDING',
      createdAt: new Date(payload.created_at),
      updatedAt: new Date(),
    };

    this.orderStore.set(order.id, order);
    this.logger.log(`Swiggy order mapped: internalId=${order.id}`);

    return order;
  }

  handleZomatoWebhook(payload: ZomatoWebhookPayload): InternalAggregatorOrder {
    this.logger.log(`Zomato webhook received: order=${payload.order_id}`);

    if (!payload.order_id || !payload.restaurant_id) {
      throw new BadRequestException('Invalid Zomato webhook payload: missing order_id or restaurant_id');
    }

    if (!payload.order_details?.items?.length) {
      throw new BadRequestException('Invalid Zomato webhook payload: order has no items');
    }

    const order: InternalAggregatorOrder = {
      id: `agg-zomato-${payload.order_id}-${Date.now()}`,
      platform: 'ZOMATO',
      platformOrderId: payload.order_id,
      restaurantId: payload.restaurant_id,
      items: payload.order_details.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers || [],
      })),
      total: payload.order_details.total,
      paymentMethod: payload.order_details.payment_method,
      customer: {
        name: payload.customer.name,
        phone: payload.customer.phone,
        address: payload.customer.address,
      },
      status: 'PENDING',
      createdAt: new Date(payload.created_at),
      updatedAt: new Date(),
    };

    this.orderStore.set(order.id, order);
    this.logger.log(`Zomato order mapped: internalId=${order.id}`);

    return order;
  }

  // ──────────────────────────────────────────────
  //  Order Status Sync
  // ──────────────────────────────────────────────

  async updateAggregatorStatus(
    orderId: string,
    status: AggregatorOrderStatus,
    platform: AggregatorPlatform,
    platformOrderId: string,
  ): Promise<InternalAggregatorOrder> {
    const order = this.orderStore.get(orderId);
    if (!order) {
      throw new NotFoundException(`Aggregator order not found: ${orderId}`);
    }

    // Validate status transitions
    const validTransitions: Record<AggregatorOrderStatus, AggregatorOrderStatus[]> = {
      PENDING: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
      READY_FOR_PICKUP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      REJECTED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[order.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition aggregator order from ${order.status} to ${status}. ` +
        `Allowed transitions: ${allowed.join(', ') || 'none'}`,
      );
    }

    // In production, this would call the aggregator's API to notify them of the status change
    // For example:
    // if (platform === 'SWIGGY') {
    //   await this.notifySwiggy(platformOrderId, status);
    // } else if (platform === 'ZOMATO') {
    //   await this.notifyZomato(platformOrderId, status);
    // }

    order.status = status;
    order.updatedAt = new Date();
    this.orderStore.set(orderId, order);

    this.logger.log(`Aggregator order status updated: id=${orderId} status=${status}`);

    // Simulate API call to aggregator
    await this.simulateAggregatorNotification(platform, platformOrderId, status);

    return order;
  }

  /**
   * Simulates notifying the aggregator platform of a status update.
   * In production, this would make HTTP calls to Swiggy/Zomato APIs.
   */
  private async simulateAggregatorNotification(
    platform: AggregatorPlatform,
    platformOrderId: string,
    status: AggregatorOrderStatus,
  ): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    this.logger.log(
      `[${platform}] Status update sent for order ${platformOrderId}: ${status}`,
    );
  }

  // ──────────────────────────────────────────────
  //  Order Retrieval
  // ──────────────────────────────────────────────

  getOrder(orderId: string): InternalAggregatorOrder | null {
    return this.orderStore.get(orderId) ?? null;
  }

  getAllOrders(): InternalAggregatorOrder[] {
    return Array.from(this.orderStore.values());
  }

  getOrdersByPlatform(platform: AggregatorPlatform): InternalAggregatorOrder[] {
    return this.getAllOrders().filter((o) => o.platform === platform);
  }

  getOrdersByStatus(status: AggregatorOrderStatus): InternalAggregatorOrder[] {
    return this.getAllOrders().filter((o) => o.status === status);
  }

  // ──────────────────────────────────────────────
  //  Mock Payload Generators
  // ──────────────────────────────────────────────

  getMockSwiggyOrder(): SwiggyWebhookPayload {
    return {
      order_id: 'SW123456',
      restaurant_id: 'REST001',
      order_details: {
        items: [
          { id: 'item1', name: 'Butter Chicken', quantity: 2, price: 449 },
          { id: 'item2', name: 'Garlic Naan', quantity: 4, price: 69 },
        ],
        total: 1174,
        payment_method: 'ONLINE',
      },
      customer: {
        name: 'Rahul Sharma',
        phone: '9876543210',
        address: '123, MG Road, Bangalore',
      },
      created_at: '2026-07-06T19:30:00Z',
    };
  }

  getMockZomatoOrder(): ZomatoWebhookPayload {
    return {
      order_id: 'ZM789012',
      restaurant_id: 'REST002',
      order_details: {
        items: [
          { id: 'item3', name: 'Chicken Biryani', quantity: 1, price: 399 },
          { id: 'item4', name: 'Dal Makhani', quantity: 1, price: 299 },
        ],
        total: 698,
        payment_method: 'COD',
      },
      customer: {
        name: 'Priya Patel',
        phone: '9988776655',
        address: '456, JP Nagar, Bangalore',
      },
      created_at: '2026-07-06T20:15:00Z',
    };
  }
}
