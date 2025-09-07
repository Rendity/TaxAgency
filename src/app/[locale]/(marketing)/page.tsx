import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Questionnaire from '@/components/Questionnaire';
import { getStepsData } from '@/components/Questionnaire/stepsData';
import { getCompanyData } from '@/lib/utils';

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
  const companyHash
    = typeof searchParams?.company === 'string' ? searchParams.company : undefined;

  if (!companyHash) {
    redirect(`/${locale}/setup`);
  }

  // Validate company via API
  const companyData = await getCompanyData(companyHash);
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
