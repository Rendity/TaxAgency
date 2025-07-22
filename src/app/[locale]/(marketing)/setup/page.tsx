import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import SetupForm from '@/components/SetupForm/index';

type IIndexProps = {
  params: { locale: string };
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = props.params ?? 'de';
  const t = await getTranslations({
    locale,
    namespace: 'setup',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Setup({ params }: IIndexProps) {
  const { locale } = params ?? 'de';

  setRequestLocale(locale);

  return (
    <SetupForm />
  );
}
