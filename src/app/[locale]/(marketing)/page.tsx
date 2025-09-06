import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Questionnaire from '@/components/Questionnaire';
import { getStepsData } from '@/components/Questionnaire/stepsData';
import type { SetupFormValues } from '@/app/api/setup/model';

type IIndexProps = {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: IIndexProps): Promise<Metadata> {
  const { locale } = params ?? { locale: 'de' };
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index({ params, searchParams }: IIndexProps) {
  const { locale } = params ?? { locale: 'de' };
  const companyHash = typeof searchParams?.company === 'string' ? searchParams.company : undefined;

  if (!companyHash) {
    redirect(`/${locale}/setup`);
  }

  // ✅ safer: use API absolute URL or call DB/service function directly
  let companyData: SetupFormValues | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/setup?hash=${encodeURIComponent(companyHash)}`, {
      cache: 'no-store', // always fresh
    });

    if (res.ok) {
      companyData = await res.json();
    }
  } catch (err) {
    console.error('Error validating company hash:', err);
  }

  if (!companyData) {
    redirect(`/${locale}/setup`);
  }

  setRequestLocale(locale);

  const steps = await getStepsData(locale, companyData.doubleEntry === 'true');

  return (
    <Questionnaire
      client={Number(companyData.clientId)}
      company={String(companyData.companyName)}
      doubleEntry={companyData.doubleEntry === 'true'}
      steps={steps}
    />
  );
}
