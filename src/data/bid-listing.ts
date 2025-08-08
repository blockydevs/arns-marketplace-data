import { AOProcess, ARIO, MARIO_PER_ARIO, type AoClient, type AoSigner } from '@ar.io/sdk/web';

interface Props {
  ao: AoClient;
  signer: AoSigner;
  walletAddress: string;
  orderId: string;
  bidPrice: string;
  marketplaceProcessId: string;
  antTokenId: string;
  swapTokenId: string;
}

export async function bidListing(props: Props) {
  const { ao, signer, walletAddress, orderId, bidPrice, marketplaceProcessId, antTokenId, swapTokenId } = props;
  const contract = ARIO.init({ signer, process: new AOProcess({ ao, processId: swapTokenId }) });

  const rawData = await contract.transfer(
    { target: marketplaceProcessId, qty: Number(bidPrice) * MARIO_PER_ARIO },
    {
      tags: [
        {
          name: 'X-Order-Action',
          value: 'Create-Order'
        },
        {
          name: 'X-Order-Type',
          value: 'english'
        },
        {
          name: 'X-Dominant-Token',
          value: swapTokenId
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
