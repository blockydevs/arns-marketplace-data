import type { OrderStatus, OwnershipType } from './common';

export interface RawCompletedListingCommonFields {
  Domain: string;
  SwapToken: string;
  DominantToken: string;
  Quantity: string;
  OrderId: string;
  Sender: string;
  Receiver: string;
  CreatedAt: number;
  OwnershipType: OwnershipType;
  LeaseStartTimestamp?: number;
  LeaseEndTimestamp?: number;
  EndedAt: number;
}

export type RawCompletedListingFixed = RawCompletedListingCommonFields & {
  OrderType: 'fixed';
  Price: string;
  ExpirationTime?: number;
} & (
    | {
        Status: Extract<OrderStatus, 'settled'>;
        Receiver: string;
        FinalPrice: string;
      }
    | {
        Status: Extract<OrderStatus, 'expired'>;
      }
    | {
        Status: Extract<OrderStatus, 'cancelled'>;
      }
  );

export type RawCompletedListingEnglish = RawCompletedListingCommonFields & {
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
        Status: Extract<OrderStatus, 'ready-for-settlement'>;
        HighestBid: string;
        HighestBidder: string;
      }
    | {
        Status: Extract<OrderStatus, 'settled'>;
        Receiver: string;
        HighestBid: string;
        HighestBidder: string;
        SettlementDate: number;
        Settlement: {
          Quantity: string;
          Timestamp: number;
          Winner: string;
          WinningBid: string;
        };
      }
    | {
        Status: Extract<OrderStatus, 'expired'>;
        HighestBid?: string;
        HighestBidder?: string;
      }
    | {
        Status: Extract<OrderStatus, 'cancelled'>;
        HighestBid?: string;
        HighestBidder?: string;
      }
  );

export type RawCompletedListingDutch = RawCompletedListingCommonFields & {
  OrderType: 'dutch';
  Price: string;
  DecreaseStep: string;
  MinimumPrice: string;
  DecreaseInterval: string;
  ExpirationTime: number;
} & (
    | {
        Status: Extract<OrderStatus, 'settled'>;
        Receiver: string;
        FinalPrice: string;
      }
    | {
        Status: Extract<OrderStatus, 'expired'>;
      }
    | {
        Status: Extract<OrderStatus, 'cancelled'>;
      }
  );

export type RawCompletedListing = RawCompletedListingFixed | RawCompletedListingEnglish | RawCompletedListingDutch;
