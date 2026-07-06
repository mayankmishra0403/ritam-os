export type AggregatorPlatform = 'SWIGGY' | 'ZOMATO';

export type AggregatorOrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'REJECTED' | 'CANCELLED';

export interface AggregatorConfig {
  outletId: string;
  platform: AggregatorPlatform;
  apiKey: string;
  apiSecret: string;
  restaurantId: string;
  isActive: boolean;
  autoAccept: boolean;
  webhookSecret: string;
}

export interface AggregatorOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
}

export interface AggregatorCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface SwiggyWebhookPayload {
  order_id: string;
  restaurant_id: string;
  order_details: {
    items: AggregatorOrderItem[];
    total: number;
    payment_method: string;
  };
  customer: AggregatorCustomer;
  created_at: string;
}

export interface ZomatoWebhookPayload {
  order_id: string;
  restaurant_id: string;
  order_details: {
    items: AggregatorOrderItem[];
    total: number;
    payment_method: string;
  };
  customer: AggregatorCustomer;
  created_at: string;
}

export interface InternalAggregatorOrder {
  id: string;
  platform: AggregatorPlatform;
  platformOrderId: string;
  restaurantId: string;
  items: AggregatorOrderItem[];
  total: number;
  paymentMethod: string;
  customer: AggregatorCustomer;
  status: AggregatorOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  outletId?: string;
}

export interface AggregatorStatusUpdate {
  orderId: string;
  status: AggregatorOrderStatus;
  platform: AggregatorPlatform;
  platformOrderId: string;
}
