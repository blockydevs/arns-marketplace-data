import { AOProcess, ARIO, type AoClient, type PaginationResult } from '@ar.io/sdk/web';

import { transformRawCompletedListing } from '../transformers/completed-listings';
import type { CompletedListing } from '../types/completed-listings';
import type { RawCompletedListing } from '../types/completed-listings.raw';

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

export type FetchCompletedListingsResult = Omit<
  PaginationResult<RawCompletedListing>,
  'items' | 'sortBy' | 'sortOrder'
> & {
  items: CompletedListing[];
};

export async function fetchCompletedListings(props: Props): Promise<FetchCompletedListingsResult> {
  const { ao, marketplaceProcessId, limit = 10, cursor, filters } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: marketplaceProcessId }) });

  const shouldFetchEverything = limit === 0;
  const items: RawCompletedListing[] = [];
  let hasMore = true;
  let currentCursor = cursor;
  let totalItems = 0;

  const { Name, ...filtersTagValue } = filters ?? {};
  const tags = [
    { name: 'Action', value: 'Get-Completed-Orders' },
    { name: 'Sort-By', value: 'EndedAt' },
    { name: 'Sort-Order', value: 'desc' },
    ...(currentCursor ? [{ name: 'Cursor', value: currentCursor }] : []),
    ...(filters ? [{ name: 'Filters', value: JSON.stringify(filtersTagValue) }] : []),
    ...(Name ? [{ name: 'NameFilter', value: Name.trim() }] : [])
  ];

  if (shouldFetchEverything) {
    while (hasMore) {
      const page = await contract.process.read<PaginationResult<RawCompletedListing>>({
        tags: [...tags, { name: 'Limit', value: '100' }]
      });

      items.push(...page.items);
      currentCursor = page.nextCursor;
      hasMore = page.hasMore;
      totalItems = page.totalItems;
    }
  } else {
    const page = await contract.process.read<PaginationResult<RawCompletedListing>>({
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
    items: items.map(transformRawCompletedListing)
  };
}
