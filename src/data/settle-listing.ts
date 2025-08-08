import { AOProcess, ARIO, type AoClient, type AoSigner } from '@ar.io/sdk/web';

interface Props {
  ao: AoClient;
  signer: AoSigner;
  orderId: string;
  marketplaceProcessId: string;
}

export async function settleListing(props: Props) {
  const { ao, signer, orderId, marketplaceProcessId } = props;
  const contract = ARIO.init({ signer, process: new AOProcess({ ao, processId: marketplaceProcessId }) });

  const rawData = await contract.process.send({
    signer,
    data: JSON.stringify({ OrderId: orderId }),
    tags: [
      {
        name: 'Action',
        value: 'Settle-Auction'
      }
    ]
  });

  return rawData;
}
