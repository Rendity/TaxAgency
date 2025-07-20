import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Questionnaire from '@/components/Questionnaire/index';
import { getStepsData } from '@/components/Questionnaire/stepsData';

type IIndexProps = {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = props.params ?? 'de';
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
  const { locale } = params ?? 'de';

  const client = searchParams?.client;
  const company = searchParams?.company;
  const doubleEntry = searchParams?.doubleEntry === 'true' || false;

  const isValidClient = client && !Number.isNaN(Number(client));
  const isValidCompany = typeof company === 'string' && company.trim().length > 0;

  if (!isValidClient || !isValidCompany) {
    notFound(); // ⛔ trigger 404
  }

  setRequestLocale(locale);
  const steps = await getStepsData(locale, doubleEntry);

  return (
    <Questionnaire
      client={Number(client)}
      company={String(company)}
      doubleEntry={Boolean(doubleEntry)}
      steps={steps}
    />
  );
}
