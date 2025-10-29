import { AOProcess, ARIO, type AoClient, type PaginationResult } from '@ar.io/sdk/web';

import type { ANTMetadata, AntRecord } from '../types/common';

interface Props {
  ao: AoClient;
  arioProcessId: string;
  antIds: string[];
}

export type FetchANTsMetadataResult = Record<string, ANTMetadata>;

export async function fetchANTsMetadata(props: Props): Promise<FetchANTsMetadataResult> {
  const { ao, arioProcessId, antIds } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: arioProcessId }) });

  const page = await contract.process.read<PaginationResult<AntRecord>>({
    tags: [
      { name: 'Action', value: 'Paginated-Records' },
      { name: 'Filters', value: JSON.stringify({ processId: antIds }) },
      { name: 'Limit', value: antIds.length.toString() }
    ]
  });

  const result = page.items.reduce<FetchANTsMetadataResult>((acc, item: AntRecord) => {
    acc[item.processId] = {
      processId: item.processId,
      name: item.name,
      ownershipType: item.type,
      purchasePrice: item.purchasePrice,
      purchasedAt: new Date(item.startTimestamp).toISOString(),
      leaseEndsAt: item.endTimestamp ? new Date(item.endTimestamp).toISOString() : null
    };

    return acc;
  }, {});

  return result;
}
