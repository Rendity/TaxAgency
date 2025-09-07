'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function SetupLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const redirectPath = searchParams.get('redirect') || '/setup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SETUP_PASSWORD) {
      document.cookie = `setup_auth=true; path=/; max-age=${60 * 60 * 2}`;
      router.push(redirectPath);
    } else {
      setError('Falsches Passwort');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Setup - Digitaler Belegaustausch</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Passwort eingeben"
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default function SetupLoginPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <SetupLoginForm />
    </Suspense>
  );
}
