import type { OrderStatus, OwnershipType } from './common';

export interface RawListingDetailsCommonFields {
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

export type RawListingFixedDetails = RawListingDetailsCommonFields & {
  OrderType: 'fixed';
  Price: string;
  ExpirationTime?: number;
} & (
    | {
        Status: Extract<OrderStatus, 'active'>;
      }
    | {
        Status: Extract<OrderStatus, 'settled'>;
        Receiver: string;
        FinalPrice: string;
        EndedAt: number;
      }
    | {
        Status: Extract<OrderStatus, 'expired'>;
        EndedAt: number;
      }
    | {
        Status: Extract<OrderStatus, 'cancelled'>;
        EndedAt: number;
      }
  );

export type RawListingEnglishDetails = RawListingDetailsCommonFields & {
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
        EndedAt: number;
      }
    | {
        Status: Extract<OrderStatus, 'expired'>;
        HighestBid?: string;
        HighestBidder?: string;
        EndedAt: number;
      }
    | {
        Status: Extract<OrderStatus, 'cancelled'>;
        HighestBid?: string;
        HighestBidder?: string;
        EndedAt: number;
      }
  );

export type RawListingDutchDetails = RawListingDetailsCommonFields & {
  OrderType: 'dutch';
  Price: string;
  DecreaseStep: string;
  MinimumPrice: string;
  DecreaseInterval: string;
  ExpirationTime: number;
} & (
    | {
        Status: Extract<OrderStatus, 'active'>;
      }
    | {
        Status: Extract<OrderStatus, 'settled'>;
        Receiver: string;
        FinalPrice: string;
        EndedAt: number;
      }
    | {
        Status: Extract<OrderStatus, 'expired'>;
        EndedAt: number;
      }
    | {
        Status: Extract<OrderStatus, 'cancelled'>;
        EndedAt: number;
      }
  );

export type RawListingDetails = RawListingFixedDetails | RawListingEnglishDetails | RawListingDutchDetails;
