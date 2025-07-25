'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SetupFormSchema = z.object({
  clientId: z.number({ required_error: 'Client ID is required' }),
  companyName: z.string().min(1, 'Company name is required'),
  doubleEntry: z.boolean({ required_error: 'Doppelte Buchhaltung ist erforderlich' }),
});

type FormValues = z.infer<typeof SetupFormSchema>;

export default function SetupForm() {
  const { locale } = useParams() as { locale: string };
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(SetupFormSchema),
    defaultValues: {
      doubleEntry: true,
    },
  });

  const onSubmit = (data: FormValues) => {
    const query = new URLSearchParams({
      client: data.clientId.toString(),
      company: data.companyName,
      doubleEntry: data.doubleEntry.toString(),
    }).toString();

    const fullUrl = `${window.location.origin}/${locale}?${query}`;
    setGeneratedUrl(fullUrl);

    navigator.clipboard.writeText(fullUrl)
      .then(() => toast.success('Der Link wurde in die Zwischenablage kopiert!'))
      .catch(() => toast.error('Link konnte nicht kopiert werden'));
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="doubleEntry"
            checked={watch('doubleEntry')}
            onChange={(e) => {
              setValue('doubleEntry', e.target.checked);
            }}
          />
          <Label htmlFor="doubleEntry">Doppelte Buchhaltung</Label>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Link für den neuen Klienten erstellen</Button>
      </form>

      {generatedUrl && (
        <div className="mt-4 p-4 border rounded bg-muted text-sm break-all">
          <p className="font-medium">Link für den neuen Klienten:</p>
          <p>{generatedUrl}</p>
        </div>
      )}
    </div>
  );
}
