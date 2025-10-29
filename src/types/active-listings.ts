import type { OrderStatus } from './common';

export interface ActiveListingCommonFields {
  orderId: string;
  sender: string;
  antProcessId: string;
  quantity: string;
  duration: number | null;
  createdAt: string;
}

export type ActiveListingFixed = ActiveListingCommonFields & {
  type: 'fixed';
  price: string;
  expiresAt: string | null;
} & (
    | {
        status: Extract<OrderStatus, 'active'>;
      }
    | {
        status: Extract<OrderStatus, 'processing'>;
      }
  );

export type ActiveListingEnglish = ActiveListingCommonFields & {
  type: 'english';
  price: string;
  startingPrice: string;
  bids: {
    timestamp: string;
    amount: string;
    bidder: string;
  }[];
  highestBid: string | null;
  highestBidder: string | null;
  expiresAt: string | null;
} & (
    | {
        status: Extract<OrderStatus, 'active'>;
      }
    | {
        status: Extract<OrderStatus, 'processing'>;
      }
    | {
        status: Extract<OrderStatus, 'ready-for-settlement'>;
        highestBid: string;
        highestBidder: string;
      }
  );

export type ActiveListingDutch = ActiveListingCommonFields & {
  type: 'dutch';
  startingPrice: string;
  decreaseStep: string;
  minimumPrice: string;
  decreaseInterval: string;
  expiresAt: string;
} & (
    | {
        status: Extract<OrderStatus, 'active'>;
      }
    | {
        status: Extract<OrderStatus, 'processing'>;
      }
  );

export type ActiveListing = ActiveListingFixed | ActiveListingEnglish | ActiveListingDutch;
