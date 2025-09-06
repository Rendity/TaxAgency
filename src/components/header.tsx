'use client';

import { Phone } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 bg-white shadow-md z-50 px-6 py-4 flex items-center">
      {/* Left spacer */}
      <div className="flex-1" />

      {/* Center logo */}
      <div className="flex-1 flex justify-center">
        <Image
          src="https://abgwt.at/wp-content/themes/abg/images/logo.svg"
          alt="Logo"
          className="h-12"
          width={120}
          height={48}
        />
      </div>

      {/* Right phone button */}
      <div className="flex-1 flex justify-end">
        <a
          href="tel:+4318764035"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          <Phone className="h-5 w-5" />
          01&nbsp;8764035
        </a>
      </div>
    </header>
  );
}
