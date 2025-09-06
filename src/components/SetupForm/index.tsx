'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SetupFormSchema } from '@/app/api/setup/model';
import type { SetupFormValues } from '@/app/api/setup/model';

export default function SetupForm() {
  const { locale } = useParams() as { locale: string };
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    // control,
    formState: { errors },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(SetupFormSchema),
    defaultValues: {
      doubleEntry: 'true',
    },
  });

  const onSubmit = async (data: SetupFormValues) => {
    const response = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      if (result) {
        const fullUrl = `${window.location.origin}/${locale}?company=${result.hash}`;
        setGeneratedUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl)
          .then(() => toast.success('Der Link wurde in die Zwischenablage kopiert!'))
          .catch(() => toast.error('Link konnte nicht kopiert werden'));
      }
    } else {
      toast.error(response.statusText || 'Fehler beim Erstellen des Links');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Neuen Klienten anlegen</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="clientId">ID des Klienten</Label>
          <Input
            type="number"
            id="clientId"
            {...register('clientId', { valueAsNumber: true })}
          />
          {errors.clientId && (
            <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="companyName">Firmenname</Label>
          <Input id="companyName" {...register('companyName')} />
          {errors.companyName && (
            <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="doubleEntry">Buchhaltungsart</Label>
          <select
            id="doubleEntry"
            {...register('doubleEntry')}
            className="w-full border rounded p-2"
            defaultValue="true"
          >
            <option value="true">Doppelte Buchhaltung</option>
            <option value="false">Einfache Buchhaltung</option>
          </select>
          {errors.doubleEntry && (
            <p className="text-sm text-red-600 mt-1">{errors.doubleEntry.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Link für den neuen Klienten erstellen
        </Button>
      </form>

      {generatedUrl && (
        <div className="mt-4 p-4 border rounded bg-muted text-sm">
          <p className="font-medium mb-2">Link für den neuen Klienten:</p>
          <div className="flex items-center gap-2">
            <Input readOnly value={generatedUrl} className="flex-1" />
            <Button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(generatedUrl)
                  .then(() => toast.success('Link kopiert!'))
                  .catch(() => toast.error('Kopieren fehlgeschlagen'))}
            >
              Kopieren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
