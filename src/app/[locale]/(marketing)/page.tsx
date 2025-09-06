import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Questionnaire from '@/components/Questionnaire/index';
import { getStepsData } from '@/components/Questionnaire/stepsData';

type IIndexProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params ?? 'de';
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index({ params, searchParams }: IIndexProps) {
  const { locale } = await params ?? 'de';
  const queryParams = await searchParams;
  const client = queryParams?.client;
  const company = queryParams?.company;
  const doubleEntry = queryParams?.doubleEntry === 'true' || false;

  const isValidClient = client && !Number.isNaN(Number(client));
  const isValidCompany = typeof company === 'string' && company.trim().length > 0;

  if (!isValidClient || !isValidCompany) {
    redirect('/setup');
  }

  setRequestLocale(locale);
  const steps = await getStepsData(locale, doubleEntry);

  return (
    <Questionnaire
      client={Number(client)}
      company={String(company)}
      doubleEntry={doubleEntry}
      steps={steps}
    />
  );
}
