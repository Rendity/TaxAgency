import { AppConfig } from '@/utils/AppConfig';
import Image from 'next/image';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full px-1 text-gray-700 antialiased">
      <header className="sticky top-0 bg-white shadow-md z-50 px-6 py-4 flex place-items-center items-center">
        <div className="w-full justify-center items-center">
          <Image src="https://abgwt.at/wp-content/themes/abg/images/logo.svg" alt="Logo" className="h-12 w-full" width={120} height={12} />
        </div>
      </header>
      <div className="mx-auto md:max-w-7xl">
        <main>{props.children}</main>
      </div>
      <footer className="border-t border-gray-300 py-8 text-center text-sm">
        {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
      </footer>
    </div>
  );
};
