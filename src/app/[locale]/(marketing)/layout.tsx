import { ToastContainer } from 'react-toastify';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // const { locale } = await props.params;
  // setRequestLocale(locale);
  return (
    <>
      <BaseTemplate
        leftNav={(
          <></>
        )}
      >
        <ToastContainer position="top-right" />
        <div className="py-5">{props.children}</div>
      </BaseTemplate>
    </>
  );
}
