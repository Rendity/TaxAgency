import { routing } from '@/libs/i18nNavigation';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (
    process.env.VERCEL_ENV === 'production'
    && process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

// A basic Luhn algorithm check (for credit card validation)
export const isValidCreditCard = (number: string) => {
  const cleaned = number.replace(/\D+/g, ''); // Remove spaces, non-numeric characters
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cleaned.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export function formatIban(value: string) {
  return value
    .toUpperCase() // Capitalize letters
    .replace(/\s+/g, '') // Remove existing spaces
    .replace(/(.{4})/g, '$1 ') // Add space every 4 characters
    .trim();
}

export const formatCreditCard = (value: string) => {
  // Remove non-digit characters
  const cleaned = value.replace(/\D+/g, '');

  // Format the card number in groups of 4 digits (e.g., 1234 5678 9012 3456)
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};
