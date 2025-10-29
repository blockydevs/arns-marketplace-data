import {
  ANT,
  AOProcess,
  ARIO,
  type AoArNSNameDataWithName,
  type AoClient,
  type PaginationParams
} from '@ar.io/sdk/web';

import type { OwnedANT } from '../types/common';
import { fetchActiveListings } from './fetch-active-listings';

interface Props {
  walletAddress: string;
  ao: AoClient;
  arioProcessId: string;
  marketplaceProcessId: string;
  config?: PaginationParams<AoArNSNameDataWithName>;
}

export type FetchMyANTsResult = OwnedANT[];

export async function fetchMyANTs(props: Props): Promise<FetchMyANTsResult> {
  const {
    walletAddress,
    ao,
    arioProcessId,
    marketplaceProcessId,
    config = {
      limit: 1000
    }
  } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: arioProcessId }) });

  const userDomains: Record<string, AoArNSNameDataWithName> = {};
  let cursor: string | undefined = config.cursor;
  let hasMore = true;

  // start fetching listings created by walletAddress in parallel
  const userListingsPromise = fetchActiveListings({
    ao,
    marketplaceProcessId,
    limit: 0,
    filters: { Sender: walletAddress }
  });

  while (hasMore) {
    const res = await contract.getArNSRecordsForAddress({
      address: walletAddress,
      limit: config.limit,
      cursor
    });

    res.items.forEach((record) => {
      userDomains[record.name] = record;
    });

    cursor = res.nextCursor;
    hasMore = res.hasMore;
  }

  // VERIFY OWNERSHIP: query each ANT process state to ensure Owner matches walletAddress.
  // (Authoritative source; index can be stale or reflect prior owner.)
  const records = Object.values(userDomains);

  // TODO: limit concurrency or switch to GraphQL
  // it was based on GraphQL before but got removed due to indexing delay issues (users could see domains they don't own)
  const verified = await Promise.all(
    records.map(async (record) => {
      try {
        const ant = ANT.init({ process: new AOProcess({ processId: record.processId, ao }) });
        const state = await ant.getState();
        const isOwned = state.Owner === walletAddress;

        if (!isOwned) {
          return null;
        }

        return record;
      } catch {
        return null;
      }
    })
  );
  const ownedRecords = verified.filter((r): r is AoArNSNameDataWithName => !!r);
  const userListings = await userListingsPromise;

  return ownedRecords.map((record) => ({
    ...record,
    listing: userListings.items.find((listing) => listing.antProcessId === record.processId) ?? null
  }));
}
