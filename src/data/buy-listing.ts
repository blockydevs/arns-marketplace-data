import { AOProcess, ARIO, MARIO_PER_ARIO, type AoClient, type AoSigner } from '@ar.io/sdk/web';

import type { OrderType } from '../types/common';

interface Props {
  ao: AoClient;
  signer: AoSigner;
  walletAddress: string;
  orderId: string;
  price: string;
  marketplaceProcessId: string;
  antTokenId: string;
  arioProcessId: string;
  orderType: Exclude<OrderType, 'english'>;
}

export async function buyListing(props: Props) {
  const { ao, signer, walletAddress, orderId, price, marketplaceProcessId, arioProcessId, antTokenId, orderType } =
    props;
  const contract = ARIO.init({ signer, process: new AOProcess({ ao, processId: arioProcessId }) });
  const rawData = await contract.transfer(
    { target: marketplaceProcessId, qty: Number(price) * MARIO_PER_ARIO },
    {
      tags: [
        {
          name: 'X-Order-Action',
          value: 'Create-Order'
        },
        {
          name: 'X-Order-Type',
          value: orderType
        },
        {
          name: 'X-Dominant-Token',
          value: arioProcessId
        },
        {
          name: 'X-Swap-Token',
          value: antTokenId
        },
        {
          name: 'X-Requested-Order-Id',
          value: orderId
        },
        {
          name: 'Sender',
          value: walletAddress
        }
      ]
    }
  );

  return rawData;
}
