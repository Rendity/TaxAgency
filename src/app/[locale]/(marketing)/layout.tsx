// import { DemoBanner } from '@/components/DemoBanner';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // const { locale } = await props.params;
  // setRequestLocale(locale);
  return (
    <>
      {/* <DemoBanner /> */}
      <BaseTemplate
        leftNav={(
          <></>
        )}
        rightNav={(
          <>
            <LocaleSwitcher />
          </>
        )}
      >
        <div className="py-5 text-xl [&_p]:my-6">{props.children}</div>
      </BaseTemplate>
    </>
  );
}
