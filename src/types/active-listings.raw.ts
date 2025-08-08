import type { OrderStatus, OwnershipType } from './common';

export interface RawActiveListingCommonFields {
  Domain: string;
  DominantToken: string;
  SwapToken: string;
  Quantity: string;
  OrderId: string;
  Sender: string;
  OwnershipType: OwnershipType;
  LeaseStartTimestamp?: number;
  LeaseEndTimestamp?: number;
  CreatedAt: number;
}

export type RawActiveListingFixed = RawActiveListingCommonFields & {
  Status: Extract<OrderStatus, 'active'>;
  OrderType: 'fixed';
  Price: string;
  ExpirationTime?: number;
};

export type RawActiveListingEnglish = RawActiveListingCommonFields & {
  OrderType: 'english';
  Price: string;
  StartingPrice: string;
  Bids: {
    Timestamp: number;
    Amount: string;
    Bidder: string;
  }[];
  ExpirationTime?: number;
} & (
    | {
        Status: Extract<OrderStatus, 'active'>;
        HighestBid?: string;
        HighestBidder?: string;
      }
    | {
        Status: Extract<OrderStatus, 'ready-for-settlement'>;
        HighestBid: string;
        HighestBidder: string;
      }
  );

export type RawActiveListingDutch = RawActiveListingCommonFields & {
  Status: Extract<OrderStatus, 'active'>;
  OrderType: 'dutch';
  Price: string;
  DecreaseStep: string;
  MinimumPrice: string;
  DecreaseInterval: string;
  ExpirationTime: number;
};

export type RawActiveListing = RawActiveListingFixed | RawActiveListingEnglish | RawActiveListingDutch;
