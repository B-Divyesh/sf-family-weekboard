import { describe, expect, it } from 'vitest';
import { decryptSnapshot, encryptSnapshot } from '../../src/crypto';
import type { BoardSnapshot } from '../../src/models';

const snapshot: BoardSnapshot = {
  format: 'weekboard', version: 1, exportedAt: '2026-08-28T00:00:00.000Z',
  people: [{ id: 'p1', name: 'Everyone', color: '#087d96', createdAt: '2026-08-28T00:00:00.000Z' }],
  events: [], settings: { boardName: 'Our week', theme: 'system' }
};

describe('encrypted handoff', () => {
  it('round-trips a board without exposing its content', async () => {
    const encrypted = await encryptSnapshot(snapshot, 'a good secret');
    expect(encrypted).toMatch(/^WB1\./);
    expect(encrypted).not.toContain('Everyone');
    await expect(decryptSnapshot(encrypted, 'a good secret')).resolves.toEqual(snapshot);
  });

  it('rejects the wrong passphrase with a useful error', async () => {
    const encrypted = await encryptSnapshot(snapshot, 'a good secret');
    await expect(decryptSnapshot(encrypted, 'wrong secret')).rejects.toThrow('did not match');
  });
});
