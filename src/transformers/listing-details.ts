import type { ListingDetails, ListingDetailsCommonFields } from '../types/listing-details';
import type { RawListingDetails } from '../types/listing-details.raw';

export function transformRawListingDetails(raw: RawListingDetails): ListingDetails {
  const expirationTime = raw.ExpirationTime ?? null;
  const createdAt = raw.CreatedAt;
  const hasExpired = raw.ExpirationTime ? Date.now() > raw.ExpirationTime : false;

  const commonFields: ListingDetailsCommonFields = {
    orderId: raw.OrderId,
    sender: raw.Sender,
    duration: expirationTime ? expirationTime - createdAt : null,
    antProcessId: raw.DominantToken,
    quantity: raw.Quantity,
    createdAt: new Date(createdAt).toISOString()
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
        case 'active':
          return {
            ...common,
            status: hasExpired ? 'processing' : raw.Status
          };
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
            status: raw.Status,
            endedAt: new Date(raw.EndedAt).toISOString()
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
        case 'settled':
          return {
            ...common,
            status: raw.Status,
            price: raw.Settlement.WinningBid,
            receiver: raw.Settlement.Winner,
            endedAt: new Date(raw.EndedAt).toISOString()
          };
        case 'expired':
        case 'cancelled':
          return {
            ...common,
            status: raw.Status,
            endedAt: new Date(raw.EndedAt).toISOString()
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
        case 'active': {
          return {
            ...common,
            status: hasExpired ? 'processing' : raw.Status
          };
        }
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
            status: raw.Status,
            endedAt: new Date(raw.EndedAt).toISOString()
          };
        default:
          throw new Error(`unsupported status`);
      }
    }
  }
}
