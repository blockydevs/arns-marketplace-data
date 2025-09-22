import { ANT, AOProcess, MARIO_PER_ARIO, type AoClient, type AoSigner } from '@ar.io/sdk/web';

import { retryWithBackoff } from '../utils/retry-with-backoff';
import { fetchActiveListings } from './fetch-active-listings';

type ListingConfiguration =
  | {
      type: 'fixed';
      price: string;
      expiresAt?: number;
    }
  | {
      type: 'english';
      price: string;
      expiresAt?: number;
    }
  | {
      type: 'dutch';
      price: string;
      minimumPrice: string;
      decreaseInterval: string;
      expiresAt?: number;
    };

interface Props {
  antProcessId: string;
  activityProcessId: string;
  marketplaceProcessId: string;
  swapTokenId: string;
  config: ListingConfiguration;
  ao: AoClient;
  walletAddress: string;
  signer: AoSigner;
  waitForConfirmation?: boolean;
  retryConfirmationAttempts?: number;
  retryConfirmationBaseDelayMs?: number;
}

const getTagsFromConfiguration = (config: ListingConfiguration) => {
  const atomicPrice = Number(config.price) * MARIO_PER_ARIO;

  switch (config.type) {
    case 'fixed': {
      return [
        {
          name: 'X-Order-Type',
          value: 'fixed'
        },
        {
          name: 'X-Price',
          value: atomicPrice.toString()
        }
      ];
    }
    case 'english': {
      return [
        {
          name: 'X-Order-Type',
          value: 'english'
        },
        {
          name: 'X-Price',
          value: atomicPrice.toString()
        }
      ];
    }
    case 'dutch': {
      const atomicMinimumPrice = Number(config.minimumPrice) * MARIO_PER_ARIO;

      return [
        {
          name: 'X-Order-Type',
          value: 'dutch'
        },
        {
          name: 'X-Price',
          value: atomicPrice.toString()
        },
        {
          name: 'X-Minimum-Price',
          value: atomicMinimumPrice.toString()
        },
        {
          name: 'X-Decrease-Interval',
          value: config.decreaseInterval
        }
      ];
    }
  }
};

export async function createListing(props: Props) {
  const {
    ao,
    signer,
    walletAddress,
    antProcessId,
    activityProcessId,
    marketplaceProcessId,
    swapTokenId,
    config,
    waitForConfirmation = true,
    retryConfirmationAttempts,
    retryConfirmationBaseDelayMs
  } = props;
  const contract = ANT.init({ signer, process: new AOProcess({ processId: antProcessId, ao }) });

  const rawData = await contract.transfer(
    { target: marketplaceProcessId },
    {
      tags: [
        {
          name: 'X-Order-Action',
          value: 'Create-Order'
        },
        {
          name: 'X-Dominant-Token',
          value: antProcessId
        },
        {
          name: 'X-Swap-Token',
          value: swapTokenId
        },
        {
          name: 'Sender',
          value: walletAddress
        },
        {
          name: 'Quantity',
          value: '1'
        },
        ...(config.expiresAt
          ? [
              {
                name: 'X-Expiration-Time',
                value: config.expiresAt.toString()
              }
            ]
          : []),
        ...getTagsFromConfiguration(config)
      ]
    }
  );

  if (!waitForConfirmation) {
    return {
      messageId: rawData.id,
      listing: null
    };
  }

  // check if listing is available
  const listing = await retryWithBackoff(
    async () => {
      const result = await fetchActiveListings({
        ao,
        activityProcessId,
        limit: 1,
        filters: {
          Sender: walletAddress,
          DominantToken: antProcessId
        }
      });

      const [listing] = result.items;

      if (!listing) {
        throw new Error(`New listing details not found`);
      }

      return listing;
    },
    retryConfirmationAttempts,
    retryConfirmationBaseDelayMs
  ).catch(() => {
    return null;
  });

  return {
    messageId: rawData.id,
    listing
  };
}
