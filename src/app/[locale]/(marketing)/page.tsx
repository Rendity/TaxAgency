import Questionnaire from '@/components/Questionnaire/index';
import { getStepsData } from '@/components/Questionnaire/stepsData';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

type IIndexProps = {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(props: IIndexProps) {
  const { locale } = props.params;
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
  const { locale } = params;

  const client = searchParams?.client;
  const company = searchParams?.company;

  const isValidClient = client && !Number.isNaN(Number(client));
  const isValidCompany = typeof company === 'string' && company.trim().length > 0;

  if (!isValidClient || !isValidCompany) {
    notFound(); // ⛔ trigger 404
  }

  setRequestLocale(locale);
  const steps = await getStepsData(locale);

  return (
    <Questionnaire
      client={Number(client)}
      company={String(company)}
      steps={steps}
    />
  );
}
