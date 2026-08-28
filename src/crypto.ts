import type { BoardSnapshot } from './models';

interface EncryptedPayload {
  format: 'weekboard-encrypted';
  version: 1;
  salt: string;
  iv: string;
  data: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>, usage: KeyUsage[]): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );
}

export async function encryptSnapshot(snapshot: BoardSnapshot, passphrase: string): Promise<string> {
  if (passphrase.length < 8) throw new Error('Use a passphrase with at least 8 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ['encrypt']);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(snapshot)));
  const payload: EncryptedPayload = {
    format: 'weekboard-encrypted', version: 1,
    salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(data))
  };
  return `WB1.${bytesToBase64(encoder.encode(JSON.stringify(payload)))}`;
}

export async function decryptSnapshot(code: string, passphrase: string): Promise<BoardSnapshot> {
  try {
    const raw = code.trim().replace(/^WB1\./, '');
    const payload = JSON.parse(decoder.decode(base64ToBytes(raw))) as EncryptedPayload;
    if (payload.format !== 'weekboard-encrypted' || payload.version !== 1) throw new Error();
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const key = await deriveKey(passphrase, salt, ['decrypt']);
    const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(payload.data));
    return JSON.parse(decoder.decode(data)) as BoardSnapshot;
  } catch {
    throw new Error('That handoff code or passphrase did not match. Check both and try again.');
  }
}
