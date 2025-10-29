import type { OrderStatus } from './common';

export interface RawActivityOrder {
  DominantToken: string;
  SwapToken: string;
  OrderId: string;
  OrderType: string;
  Status: OrderStatus;
}

export interface RawActivity {
  ExpiredOrders: RawActivityOrder[];
  CancelledOrders: RawActivityOrder[];
  ListedOrders: RawActivityOrder[];
  ExecutedOrders: RawActivityOrder[];
}
