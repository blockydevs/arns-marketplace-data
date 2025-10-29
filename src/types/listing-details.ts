import type { OrderStatus } from './common';

export interface ListingDetailsCommonFields {
  orderId: string;
  sender: string;
  antProcessId: string;
  quantity: string;
  duration: number | null;
  createdAt: string;
}

export type ListingFixedDetails = ListingDetailsCommonFields & {
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
    | {
        status: Extract<OrderStatus, 'settled'>;
        receiver: string;
        finalPrice: string;
        endedAt: string;
      }
    | {
        status: Extract<OrderStatus, 'expired'>;
        endedAt: string;
      }
    | {
        status: Extract<OrderStatus, 'cancelled'>;
        endedAt: string;
      }
  );

export type ListingEnglishDetails = ListingDetailsCommonFields & {
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
    | {
        status: Extract<OrderStatus, 'settled'>;
        receiver: string;
        endedAt: string;
      }
    | {
        status: Extract<OrderStatus, 'expired'>;
        endedAt: string;
      }
    | {
        status: Extract<OrderStatus, 'cancelled'>;
        endedAt: string;
      }
  );

export type ListingDutchDetails = ListingDetailsCommonFields & {
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
    | {
        status: Extract<OrderStatus, 'settled'>;
        receiver: string;
        finalPrice: string;
        endedAt: string;
      }
    | {
        status: Extract<OrderStatus, 'expired'>;
        endedAt: string;
      }
    | {
        status: Extract<OrderStatus, 'cancelled'>;
        endedAt: string;
      }
  );

export type ListingDetails = ListingFixedDetails | ListingEnglishDetails | ListingDutchDetails;
