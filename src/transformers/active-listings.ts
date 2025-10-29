import type { ActiveListing, ActiveListingCommonFields } from '../types/active-listings';
import type { RawActiveListing } from '../types/active-listings.raw';

export function transformRawActiveListing(raw: RawActiveListing): ActiveListing {
  const expirationTime = raw.ExpirationTime ?? null;
  const createdAt = raw.CreatedAt;
  const hasExpired = raw.ExpirationTime ? Date.now() > raw.ExpirationTime : false;

  const commonFields: ActiveListingCommonFields = {
    orderId: raw.OrderId,
    sender: raw.Sender,
    duration: expirationTime ? expirationTime - createdAt : null,
    antProcessId: raw.DominantToken,
    quantity: raw.Quantity,
    createdAt: new Date(createdAt).toISOString()
  };

  switch (raw.OrderType) {
    case 'fixed': {
      return {
        ...commonFields,
        status: hasExpired ? 'processing' : raw.Status,
        type: 'fixed',
        price: raw.Price,
        expiresAt: expirationTime ? new Date(expirationTime).toISOString() : null
      };
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
        case 'active':
          return {
            ...common,
            status: hasExpired ? 'processing' : raw.Status
          };
        case 'ready-for-settlement':
          return {
            ...common,
            status: raw.Status,
            highestBid: raw.HighestBid,
            highestBidder: raw.HighestBidder
          };
        default:
          throw new Error(`unsupported status`);
      }
    }
    case 'dutch': {
      return {
        ...commonFields,
        status: hasExpired ? 'processing' : raw.Status,
        type: 'dutch',
        startingPrice: raw.Price,
        decreaseInterval: raw.DecreaseInterval,
        decreaseStep: raw.DecreaseStep,
        minimumPrice: raw.MinimumPrice,
        expiresAt: new Date(raw.ExpirationTime).toISOString()
      };
    }
  }
}
