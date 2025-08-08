import { AOProcess, ARIO, type AoArNSNameDataWithName, type AoClient, type PaginationParams } from '@ar.io/sdk/web';
import arweaveGraphql from 'arweave-graphql';

import type { ActiveListing } from '../types/active-listings';
import type { OwnedANT } from '../types/common';
import { fetchActiveListings } from './fetch-active-listings';

interface Props {
  walletAddress: string;
  ao: AoClient;
  networkProcessId: string;
  activityProcessId: string;
  graphqlUrl: string;
  config?: PaginationParams<AoArNSNameDataWithName>;
}

export type FetchMyANTsResult = (AoArNSNameDataWithName & { listing: ActiveListing | null })[];

export async function fetchMyANTs(props: Props): Promise<FetchMyANTsResult> {
  const {
    walletAddress,
    ao,
    networkProcessId,
    activityProcessId,
    graphqlUrl,
    config = {
      limit: 1000
    }
  } = props;
  const contract = ARIO.init({ process: new AOProcess({ processId: networkProcessId, ao }) });

  const userDomains: Record<string, AoArNSNameDataWithName> = {};
  let cursor: string | undefined = config.cursor;
  let hasMore = true;

  // start fetching listings created by walletAddress in parallel
  const userListingsPromise = fetchActiveListings({
    ao,
    activityProcessId,
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

  // verify ownership of each ANT process
  const records = Object.values(userDomains);
  const gql = arweaveGraphql(graphqlUrl);
  const [queryMetadataResult, userListings] = await Promise.all([
    gql.getTransactions({ ids: records.map((r) => r.processId), first: 1000 }),
    userListingsPromise
  ]);

  const ownedRecords = queryMetadataResult.transactions.edges.reduce<OwnedANT[]>((acc, edge) => {
    const record = records.find((r) => r.processId === edge.node.id);
    if (!record) return acc;
    const listing = userListings.items.find((listing) => listing.antProcessId === record.processId) ?? null;
    acc.push({ ...record, listing });
    return acc;
  }, []);

  return ownedRecords;
}
