import { MARIO_PER_ARIO } from '@ar.io/sdk';
import { BigNumber } from 'bignumber.js';

export const marioToArio = (mario: string | number) => {
  return new BigNumber(mario).dividedBy(MARIO_PER_ARIO).toFixed();
};
