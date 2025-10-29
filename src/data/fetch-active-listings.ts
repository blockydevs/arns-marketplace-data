import { AOProcess, ARIO, type AoClient, type PaginationResult } from '@ar.io/sdk/web';

import { transformRawActiveListing } from '../transformers/active-listings';
import type { ActiveListing } from '../types/active-listings';
import type { RawActiveListing } from '../types/active-listings.raw';

interface Props {
  ao: AoClient;
  marketplaceProcessId: string;
  limit?: number;
  cursor?: string;
  filters?: {
    Sender?: string;
    DominantToken?: string;
    Name?: string;
  };
}

export type FetchActiveListingsResult = Omit<PaginationResult<RawActiveListing>, 'items' | 'sortBy' | 'sortOrder'> & {
  items: ActiveListing[];
};

export async function fetchActiveListings(props: Props): Promise<FetchActiveListingsResult> {
  const { ao, marketplaceProcessId, limit = 10, cursor, filters } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: marketplaceProcessId }) });

  const shouldFetchEverything = limit === 0;
  const items: RawActiveListing[] = [];
  let hasMore = true;
  let currentCursor = cursor;
  let totalItems = 0;

  const { Name, ...filtersTagValue } = filters ?? {};
  const tags = [
    { name: 'Action', value: 'Get-Listed-Orders' },
    { name: 'Sort-By', value: 'CreatedAt' },
    { name: 'Sort-Order', value: 'desc' },
    ...(cursor ? [{ name: 'Cursor', value: cursor }] : []),
    ...(filters ? [{ name: 'Filters', value: JSON.stringify(filtersTagValue) }] : []),
    ...(Name ? [{ name: 'NameFilter', value: Name.trim() }] : [])
  ];

  if (shouldFetchEverything) {
    while (hasMore) {
      const page = await contract.process.read<PaginationResult<RawActiveListing>>({
        tags: [...tags, { name: 'Limit', value: '100' }]
      });

      items.push(...page.items);
      hasMore = page.hasMore;
      currentCursor = page.nextCursor;
      totalItems = page.totalItems;
    }
  } else {
    const page = await contract.process.read<PaginationResult<RawActiveListing>>({
      tags: [...tags, { name: 'Limit', value: limit.toString() }]
    });

    items.push(...page.items);
    hasMore = page.hasMore;
    currentCursor = page.nextCursor;
    totalItems = page.totalItems;
  }

  return {
    limit,
    totalItems,
    hasMore,
    nextCursor: hasMore ? currentCursor : undefined,
    items: items.map(transformRawActiveListing)
  };
}
