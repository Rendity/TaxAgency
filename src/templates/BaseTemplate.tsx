import { AppConfig } from '@/utils/AppConfig';
import Image from 'next/image';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full px-1 text-gray-700 antialiased">
      <header className="sticky top-0 bg-white shadow-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-left space-x-2">
          <Image src="https://abgwt.at/wp-content/themes/abg/images/logo.svg" alt="Logo" className="h-12 w-120" width={120} height={12} />
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
      </footer>
    </div>
  );
};
