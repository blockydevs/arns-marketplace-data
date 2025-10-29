import { AOProcess, ARIO, type AoArNSNameData, type AoClient } from '@ar.io/sdk/web';

import type { ActiveListing } from '../types/active-listings';
import { fetchActiveListings } from './fetch-active-listings';

interface Props {
  name: string;
  ao: AoClient;
  arioProcessId: string;
  marketplaceProcessId: string;
}

export interface SearchANTResult {
  ant: AoArNSNameData | null;
  listing: ActiveListing | null;
}

// should return result only if that exact domain exists
export async function searchANT(props: Props): Promise<SearchANTResult> {
  const { name, ao, arioProcessId, marketplaceProcessId } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: arioProcessId }) });

  const [queryAnt, queryListings] = await Promise.all([
    contract.getArNSRecord({ name }) as unknown as Promise<AoArNSNameData | undefined>,
    fetchActiveListings({
      ao,
      marketplaceProcessId,
      filters: { Name: name }
    })
  ]);

  const ant = queryAnt ?? null;
  const listing = ant ? (queryListings.items.find((l) => l.antProcessId === ant.processId) ?? null) : null;

  const result = {
    ant,
    listing
  };

  return result;
}
