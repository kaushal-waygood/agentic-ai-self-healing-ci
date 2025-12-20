import crypto from 'crypto';

export function stableShuffle(array, seed) {
  const arr = [...array];

  function hash(i) {
    return crypto.createHash('sha256').update(`${seed}:${i}`).digest('hex');
  }

  arr.sort((a, b) => {
    const ha = hash(a._id.toString());
    const hb = hash(b._id.toString());
    return ha.localeCompare(hb);
  });

  return arr;
}
