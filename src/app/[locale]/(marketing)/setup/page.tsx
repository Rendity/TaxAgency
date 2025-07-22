import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GeneralURL from '@/components/GeneralUrl/index';

type IIndexProps = {
  params: { locale: string };
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = props.params ?? 'de';
  const t = await getTranslations({
    locale,
    namespace: 'GenerateURL',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function GenerateURL({ params }: IIndexProps) {
  const { locale } = params ?? 'de';

  setRequestLocale(locale);

  return (
    <GeneralURL />
  );
}
