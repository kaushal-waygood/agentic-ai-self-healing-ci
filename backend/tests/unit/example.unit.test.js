/**
 * Example unit test — runs without DB.
 * Copy this pattern for pure-function tests.
 */
import { safeParseInt, normalizeSet } from '../../src/utils/jobHelpers.js';

describe('safeParseInt (unit, no DB)', () => {
  it('parses valid integers', () => {
    expect(safeParseInt('42')).toBe(42);
    expect(safeParseInt('0')).toBe(0);
    expect(safeParseInt('-5')).toBe(-5);
  });

  it('returns fallback for NaN', () => {
    expect(safeParseInt('abc')).toBe(0);
    expect(safeParseInt('abc', 99)).toBe(99);
  });
});

describe('normalizeSet (unit, no DB)', () => {
  it('lowercases and dedupes strings', () => {
    expect(normalizeSet(['React', 'react', 'REACT'])).toEqual(['react']);
  });

  it('handles skill objects', () => {
    expect(normalizeSet([{ skill: 'Node.js' }, { skill: 'node.js' }])).toEqual(['node.js']);
  });
});
