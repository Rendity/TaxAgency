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

const FormSchema = z.object({
  clientId: z.number({ required_error: 'Client ID is required' }),
  companyName: z.string().min(1, 'Company name is required'),
  doubleEntry: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function GeneralURL() {
  const { locale } = useParams() as { locale: string };
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      doubleEntry: false,
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
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Generate Link</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="clientId">Client ID</Label>
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
          <Label htmlFor="companyName">Company Name</Label>
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
          <Label htmlFor="doubleEntry">Is Double Entry Accounting?</Label>
        </div>

        <Button type="submit" className="w-full">Generate Link</Button>
      </form>

      {generatedUrl && (
        <div className="mt-4 p-4 border rounded bg-muted text-sm break-all">
          <p className="font-medium">Generated URL:</p>
          <p>{generatedUrl}</p>
        </div>
      )}
    </div>
  );
}
