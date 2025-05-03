import { AppConfig } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="w-full px-1 text-gray-700 antialiased">
      <header className="sticky top-0 bg-white shadow-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-left space-x-2">
          <Image src="https://rendity.com/svg/rendity-logo.svg" alt="Logo" className="h-12 w-120" width={120} height={12} />
          <span className="text-xl font-semibold"></span>
        </div>
        {/* <div className="flex items-center space-x-4">
          {props.rightNav}
        </div> */}
      </header>
      <div className="mx-auto md:max-w-7xl">
        <main>{props.children}</main>
      </div>
      <footer className="border-t border-gray-300 py-8 text-center text-sm">
        {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
        {t.rich('made_with', {
          author: () => (
            <a
              href="https://rendity.com"
              className="text-blue-700 hover:border-b-2 hover:border-blue-700"
            >
              Rendity GmBH
            </a>
          ),
        })}
      </footer>
    </div>
  );
};
