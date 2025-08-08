import type { CompletedListing, CompletedListingCommonFields } from '../types/completed-listings';
import type { RawCompletedListing } from '../types/completed-listings.raw';

export function transformRawCompletedListing(raw: RawCompletedListing): CompletedListing {
  const leaseStartedAt = raw.LeaseStartTimestamp ?? null;
  const leaseEndsAt = raw.LeaseEndTimestamp ?? null;
  const expirationTime = raw.ExpirationTime ?? null;
  const endedAt = raw.EndedAt;
  const createdAt = raw.CreatedAt;

  const commonFields: CompletedListingCommonFields = {
    orderId: raw.OrderId,
    sender: raw.Sender,
    duration: expirationTime ? expirationTime - createdAt : null,
    name: raw.Domain,
    antProcessId: raw.DominantToken,
    quantity: raw.Quantity,
    ownershipType: raw.OwnershipType,
    leaseStartedAt: leaseStartedAt ? new Date(leaseStartedAt).toISOString() : null,
    leaseEndsAt: leaseEndsAt ? new Date(leaseEndsAt).toISOString() : null,
    createdAt: new Date(createdAt).toISOString(),
    endedAt: new Date(endedAt).toISOString()
  };

  switch (raw.OrderType) {
    case 'fixed': {
      const common = {
        ...commonFields,
        type: 'fixed',
        price: raw.Price,
        expiresAt: expirationTime ? new Date(expirationTime).toISOString() : null
      } as const;

      switch (raw.Status) {
        case 'settled':
          return {
            ...common,
            status: raw.Status,
            receiver: raw.Receiver,
            finalPrice: raw.FinalPrice,
            endedAt: new Date(raw.EndedAt).toISOString()
          };
        case 'expired':
        case 'cancelled':
          return {
            ...common,
            status: raw.Status
          };
        default:
          throw new Error(`unsupported status`);
      }
    }
    case 'english': {
      const bids = raw.Bids.map((bid) => ({
        timestamp: new Date(bid.Timestamp).toISOString(),
        amount: bid.Amount,
        bidder: bid.Bidder
      }));

      bids.sort((a, b) => Number(b.amount) - Number(a.amount));

      const common = {
        ...commonFields,
        type: 'english',
        price: raw.Price,
        startingPrice: raw.StartingPrice,
        bids,
        highestBid: raw.HighestBid ?? null,
        highestBidder: raw.HighestBidder ?? null,
        expiresAt: expirationTime ? new Date(expirationTime).toISOString() : null
      } as const;

      switch (raw.Status) {
        case 'ready-for-settlement':
          return {
            ...common,
            status: raw.Status,
            highestBid: raw.HighestBid,
            highestBidder: raw.HighestBidder
          };
        case 'settled':
          return {
            ...common,
            status: raw.Status,
            price: raw.Settlement.WinningBid,
            receiver: raw.Settlement.Winner,
            endedAt: new Date(raw.Settlement.Timestamp).toISOString()
          };
        case 'expired':
        case 'cancelled':
          return {
            ...common,
            status: raw.Status
          };
        default:
          throw new Error(`unsupported status`);
      }
    }
    case 'dutch': {
      const common = {
        ...commonFields,
        type: 'dutch',
        startingPrice: raw.Price,
        decreaseInterval: raw.DecreaseInterval,
        decreaseStep: raw.DecreaseStep,
        minimumPrice: raw.MinimumPrice,
        expiresAt: new Date(raw.ExpirationTime).toISOString()
      } as const;

      switch (raw.Status) {
        case 'settled':
          return {
            ...common,
            status: raw.Status,
            receiver: raw.Receiver,
            finalPrice: raw.FinalPrice,
            endedAt: new Date(raw.EndedAt).toISOString()
          };
        case 'expired':
        case 'cancelled':
          return {
            ...common,
            status: raw.Status
          };
        default:
          throw new Error(`unsupported status`);
      }
    }
  }
}
