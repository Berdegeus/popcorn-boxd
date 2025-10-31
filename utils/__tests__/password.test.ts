import { createPasswordHash, isPasswordValid } from '../password';

describe('password utilities', () => {
  it('creates deterministic hashes for the same password', () => {
    const password = 'Popcorn!123';
    const hashA = createPasswordHash(password);
    const hashB = createPasswordHash(password);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[0-9a-f]+$/);
  });

  it('produces different hashes for different passwords', () => {
    const hashA = createPasswordHash('Popcorn!123');
    const hashB = createPasswordHash('Different!456');

    expect(hashA).not.toBe(hashB);
  });

  it('validates passwords against the stored hash', () => {
    const password = 'TalkbackRocks';
    const hash = createPasswordHash(password);

    expect(isPasswordValid(password, hash)).toBe(true);
    expect(isPasswordValid('wrong-password', hash)).toBe(false);
  });
});
