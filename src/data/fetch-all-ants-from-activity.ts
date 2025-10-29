import { AOProcess, ARIO, type AoClient } from '@ar.io/sdk/web';

import type { RawActivity, RawActivityOrder } from '../types/activity.raw';

interface Props {
  ao: AoClient;
  marketplaceProcessId: string;
}

export type FetchAllAntsFromActivityResult = string[];

export async function fetchAllAntsFromActivity(props: Props): Promise<FetchAllAntsFromActivityResult> {
  const { ao, marketplaceProcessId } = props;
  const contract = ARIO.init({ process: new AOProcess({ ao, processId: marketplaceProcessId }) });

  const result = await contract.process.read<RawActivity | undefined>({
    tags: [{ name: 'Action', value: 'Get-Activity' }]
  });

  const antIds = new Set<string>();

  [
    ...(result?.ExpiredOrders ?? []),
    ...(result?.CancelledOrders ?? []),
    ...(result?.ListedOrders ?? []),
    ...(result?.ExecutedOrders ?? [])
  ].forEach((order: RawActivityOrder) => {
    antIds.add(order.DominantToken);
  });

  return [...antIds];
}
