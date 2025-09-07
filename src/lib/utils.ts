import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SetupFormValues } from '@/app/api/setup/model';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomPassword(length = 10): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Ensure at least one character from each group
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  // All characters combined
  const all = upper + lower + numbers + special;

  // Fill the rest of the password
  for (let i = required.length; i < length; i++) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle the array to avoid predictable order
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join('');
}

export async function getCompanyData(hash: string): Promise<SetupFormValues | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://start.abgwt.at';
    const res = await fetch(`${baseUrl}/api/setup?hash=${encodeURIComponent(hash)}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('Error fetching company data:', err);
    return null;
  }
}
