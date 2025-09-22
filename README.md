# @blockydevs/arns-marketplace-data

#### A data and utility library for working with the ArNS Marketplace on ar.io: discover listings, correlate them with Arweave Name Tokens (ANTs), and perform actions (create/buy/bid/settle/cancel) via AO messages.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Process IDs you need](#process-ids-you-need)
- [Essential APIs](#essential-apis)
    - [Read](#read)
    - [Write (requires signer)](#write-requires-signer)
- [Filtering listings](#filtering-listings)
- [Completed listings](#completed-listings)
- [Amounts & conversion](#amounts--conversion)
- [Pagination (cursor-based)](#pagination-cursor-based)
- [Write confirmations and retries](#write-confirmations-and-retries)
- [Types](#types)

## Installation

Requires Node >= 18

```bash
pnpm add @blockydevs/arns-marketplace-data @ar.io/sdk @permaweb/aoconnect arweave-graphql bignumber.js
```


## Quick Start

```tsx
import { fetchActiveListings } from '@blockydevs/arns-marketplace-data';
import { connect } from '@permaweb/aoconnect';

const ao = connect();

const listings = await fetchActiveListings({
  ao,
  activityProcessId: '<MARKETPLACE_ACTIVITY_ID>',
  limit: 10,
});

console.log(listings.items);
```


Common lookups:

```tsx
import { searchANT, fetchListingDetails } from '@blockydevs/arns-marketplace-data';

await searchANT({
  name: 'ardrive',
  ao,
  networkProcessId: '<ARIO_PROCESS_ID>',
  activityProcessId: '<MARKETPLACE_ACTIVITY_ID>',
});

await fetchListingDetails({ ao, activityProcessId: '<MARKETPLACE_ACTIVITY_ID>', orderId: '<ORDER_ID>' });
```


## Process IDs you need

- ARIO (network) Process ID – resolve names and ANT metadata
- Marketplace Activity Process ID – read listing activity
- Marketplace Contract Process ID – write actions (create/buy/bid/settle/cancel)
- Swap/Payment Token Process ID – usually ARIO token process

## Essential APIs

### Read
- `fetchActiveListings({ ao, activityProcessId, limit?, cursor?, filters? })`
- `fetchListingDetails({ ao, activityProcessId, orderId })`
- `fetchCompletedListings({ ao, activityProcessId, limit?, cursor?, filters? })`
- `fetchMyANTs({ ao, walletAddress, networkProcessId, activityProcessId, graphqlUrl, config? })`
- `searchANT({ name, ao, networkProcessId, activityProcessId })`

### Write (requires signer)

```tsx
import { ArweaveSigner } from '@ar.io/sdk/node';
import { createListing, buyListing, bidListing, settleListing, cancelListing } from '@blockydevs/arns-marketplace-data';

const signer = new ArweaveSigner(/* JWK */);

// create
await createListing({
  ao,
  signer,
  walletAddress: '<WALLET>',
  antProcessId: '<ANT_ID>',
  activityProcessId: '<MARKETPLACE_ACTIVITY_ID>',
  marketplaceProcessId: '<MARKETPLACE_ID>',
  swapTokenId: '<SWAP_TOKEN_ID>',
  config: { type: 'fixed', price: '10' },
  waitForConfirmation: true,
});

// buy (fixed/dutch)
await buyListing({
  ao,
  signer,
  walletAddress: '<WALLET>',
  orderId: '<ORDER_ID>',
  price: '12.5',
  marketplaceProcessId: '<MARKETPLACE_ID>',
  antTokenId: '<ANT_ID>',
  swapTokenId: '<SWAP_TOKEN_ID>',
  orderType: 'fixed',
});

// bid (english)
await bidListing({
  ao,
  signer,
  walletAddress: '<WALLET>',
  orderId: '<ORDER_ID>',
  bidPrice: '15',
  marketplaceProcessId: '<MARKETPLACE_ID>',
  antTokenId: '<ANT_ID>',
  swapTokenId: '<SWAP_TOKEN_ID>',
});

// finalize
await settleListing({ ao, signer, orderId: '<ORDER_ID>', marketplaceProcessId: '<MARKETPLACE_ID>' });
await cancelListing({ ao, signer, orderId: '<ORDER_ID>', marketplaceProcessId: '<MARKETPLACE_ID>' });
```


## Filtering listings

Both active and completed listings support simple server-side filtering via the `filters` option:
- `Sender`: wallet address that created the order
- `DominantToken`: the primary token (e.g., ANT process ID)
- `Name`: the ArNS name to look up (exact match)

Tips:
- Use `limit: 0` to fetch all available pages in one call (the helper will paginate under the hood).
- You can combine `filters` with `cursor` for manual pagination strategies.

## Completed listings

Fetch recently completed, settled, or cancelled orders:

```tsx
import { fetchCompletedListings } from '@blockydevs/arns-marketplace-data';

const completed = await fetchCompletedListings({
  ao,
  activityProcessId: '<MARKETPLACE_ACTIVITY_ID>',
  limit: 20, // or 0 to fetch all
  // filters: { Sender: '<WALLET>', DominantToken: '<ANT_ID>', Name: 'example' }
});

console.log(completed.items);
```


## Amounts & conversion

- Amounts for write calls are ARIO strings (e.g. `'12.5'`).
- Internally converted to mARIO to avoid float issues.

```tsx
import { marioToArio, arioToMario } from '@blockydevs/arns-marketplace-data';

marioToArio(1_000_000); // => 1
arioToMario(1.5);       // => 1_500_000
```


## Pagination (cursor-based)

Paginated responses include `items`, `nextCursor`, `hasMore`, `totalItems`.

```tsx
let cursor: string | undefined;
const all: any[] = [];

while (true) {
  const page = await fetchActiveListings({ ao, activityProcessId: '<ID>', limit: 100, cursor });
  all.push(...page.items);
  if (!page.hasMore) break;
  cursor = page.nextCursor;
}
```


## Write confirmations and retries

When creating listings, you can control confirmation behavior:
- `waitForConfirmation?: boolean` (default `true`) — waits until the new listing is visible from activity reads.
- `retryConfirmationAttempts?: number` — how many times to re-check for the new listing.
- `retryConfirmationBaseDelayMs?: number` — base delay used between retries with backoff.

This helps ensure your UI only proceeds once the listing is discoverable.

## Types

Useful exported types to help with typing and state modeling:
- `ActiveListing` and subtypes for fixed/english/dutch listings
- `ListingDetails` for a single order details view
- `CompletedListing` (for completed items)
- `OwnedANT` and common enums like `OrderType`, `OrderStatus`, `OwnershipType`