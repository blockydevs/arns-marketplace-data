import { describe, expect, it } from 'vitest';

import { invariant } from '../../utils/invariant';

describe('utils/invariant', () => {
  it('throws error when condition is falsy', () => {
    expect(() => {
      invariant(false, 'fail');
    }).toThrow(Error);
    expect(() => {
      invariant(true, 'ok');
    }).not.toThrow();
  });
});
