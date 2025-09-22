import { MARIO_PER_ARIO } from '@ar.io/sdk';
import { BigNumber } from 'bignumber.js';

export const arioToMario = (ario: string | number) => {
  return new BigNumber(ario).multipliedBy(MARIO_PER_ARIO).toFixed();
};
