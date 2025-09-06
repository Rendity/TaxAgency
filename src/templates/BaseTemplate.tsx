import { AppConfig } from '@/utils/AppConfig';
import Header from '@/components/header';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full px-1 text-gray-700 antialiased">

      <Header />
      <div className="mx-auto md:max-w-7xl">
        <main>{props.children}</main>
      </div>
      <footer className="border-t border-gray-300 py-8 text-center text-sm">
        {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
      </footer>
    </div>
  );
};
