import type { OrderStatus, OwnershipType } from './common';

export interface CompletedListingCommonFields {
  orderId: string;
  sender: string;
  name: string;
  antProcessId: string;
  quantity: string;
  duration: number | null;
  ownershipType: OwnershipType;
  leaseStartedAt: string | null;
  leaseEndsAt: string | null;
  createdAt: string;
  endedAt: string;
}

export type CompletedListingFixed = CompletedListingCommonFields & {
  type: 'fixed';
  price: string;
  expiresAt: string | null;
} & (
    | {
        status: Extract<OrderStatus, 'settled'>;
        receiver: string;
        finalPrice: string;
      }
    | {
        status: Extract<OrderStatus, 'expired'>;
      }
    | {
        status: Extract<OrderStatus, 'cancelled'>;
      }
  );

export type CompletedListingEnglish = CompletedListingCommonFields & {
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
      }
    | {
        status: Extract<OrderStatus, 'cancelled'>;
      }
  );

export type CompletedListingDutch = CompletedListingCommonFields & {
  type: 'dutch';
  startingPrice: string;
  decreaseStep: string;
  minimumPrice: string;
  decreaseInterval: string;
  expiresAt: string;
} & (
    | {
        status: Extract<OrderStatus, 'settled'>;
        receiver: string;
        finalPrice: string;
      }
    | {
        status: Extract<OrderStatus, 'expired'>;
      }
    | {
        status: Extract<OrderStatus, 'cancelled'>;
      }
  );

export type CompletedListing = CompletedListingFixed | CompletedListingEnglish | CompletedListingDutch;
