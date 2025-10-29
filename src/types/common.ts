import type { AoArNSNameDataWithName } from '@ar.io/sdk';

import type { ActiveListing } from './active-listings';

// processing is an internal status not returned by contract, it tells that order has expired but its status is still active
export type OrderStatus = 'active' | 'processing' | 'ready-for-settlement' | 'expired' | 'settled' | 'cancelled';

export type OwnershipType = 'lease' | 'permabuy';

export type OrderType = 'fixed' | 'english' | 'dutch';

export type OwnedANT = AoArNSNameDataWithName & { listing: ActiveListing | null };

export interface AntRecord {
  startTimestamp: number;
  endTimestamp?: number;
  processId: string;
  type: OwnershipType;
  name: string;
  purchasePrice: number;
  undernameLimit: number;
}

export interface ANTMetadata {
  processId: string;
  name: string;
  ownershipType: OwnershipType;
  purchasePrice: number;
  purchasedAt: string;
  leaseEndsAt: string | null;
}
