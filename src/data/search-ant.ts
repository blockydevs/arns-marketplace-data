import { AOProcess, ARIO, type AoArNSNameData, type AoClient } from '@ar.io/sdk/web';

import type { ActiveListing } from '../types/active-listings';
import { fetchActiveListings } from './fetch-active-listings';

interface Props {
  name: string;
  ao: AoClient;
  networkProcessId: string;
  activityProcessId: string;
}

export interface SearchANTResult {
  ant: AoArNSNameData | null;
  listing: ActiveListing | null;
}

// should return result only if that exact domain exists
export async function searchANT(props: Props): Promise<SearchANTResult> {
  const { name, ao, networkProcessId, activityProcessId } = props;
  const contract = ARIO.init({ process: new AOProcess({ processId: networkProcessId, ao }) });

  const [queryAnt, queryListings] = await Promise.all([
    contract.getArNSRecord({ name }) as unknown as Promise<AoArNSNameData | undefined>,
    fetchActiveListings({
      ao,
      activityProcessId,
      limit: 1,
      filters: { Name: name }
    })
  ]);

  const ant = queryAnt ?? null;
  const listing = ant ? (queryListings.items[0] ?? null) : null;

  const result = {
    ant,
    listing
  };

  return result;
}
