import { getHash } from './repository';
import { saveHash } from '@/app/api/setup/repository';

async function generateHash(query: Record<string, string | number | boolean>) {
  const queryString = JSON.stringify(query); // stable representation
  const encoder = new TextEncoder().encode(queryString);
  const buffer = await crypto.subtle.digest('SHA-256', encoder);

  // convert to short hex string
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12); // shorten for URL
}

export async function addSetupHash(data: Record<string, any>) {
  // LOOP THROUGH EACH ACCOUNT AND CREATE A FOLDER FOR EACH
  const accounts = data || [];
  if (accounts.length === 0) {
    throw new Error('Nothing found in payload');
  }
  const hash = await generateHash(data);
  const existing = await getHash(hash);
  if (existing) {
    return existing; // already exists
  }
  // SAVE THE DATA TO THE DATABASE
  const newOne = await saveHash(hash, data);
  if (newOne) {
    return newOne[0];
  }
  return null;
}

export async function getSetupHash(hash: string) {
  // SAVE THE DATA TO THE DATABASE
  return await getHash(hash);
}
