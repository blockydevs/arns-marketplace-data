import { AOProcess, ARIO, MARIO_PER_ARIO, type AoClient, type AoSigner } from '@ar.io/sdk/web';

interface Props {
  ao: AoClient;
  signer: AoSigner;
  walletAddress: string;
  orderId: string;
  bidPrice: string;
  marketplaceProcessId: string;
  arioProcessId: string;
  antTokenId: string;
}

export async function bidListing(props: Props) {
  const { ao, signer, walletAddress, orderId, bidPrice, marketplaceProcessId, arioProcessId, antTokenId } = props;
  const contract = ARIO.init({ signer, process: new AOProcess({ ao, processId: arioProcessId }) });

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
