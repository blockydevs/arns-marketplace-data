import { AOProcess, ARIO, type AoClient } from '@ar.io/sdk/web';

import { transformRawListingDetails } from '../transformers/listing-details';
import type { ListingDetails } from '../types/listing-details';
import type { RawListingDetails } from '../types/listing-details.raw';

interface Props {
  ao: AoClient;
  activityProcessId: string;
  orderId: string;
}

export type FetchListingDetailsResult = ListingDetails;

export async function fetchListingDetails(props: Props): Promise<FetchListingDetailsResult> {
  const { ao, activityProcessId, orderId } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: activityProcessId }) });

  const result = await contract.process.read<RawListingDetails | undefined>({
    tags: [
      { name: 'Action', value: 'Get-Order-By-Id' },
      { name: 'OrderId', value: orderId }
    ]
  });

  if (!result) {
    throw new Error(`Listing with id=${orderId} not found`);
  }

  return transformRawListingDetails(result);
}
