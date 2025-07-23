'use client';

import { useLocale } from 'next-intl';
import { routing } from '@/libs/i18nNavigation';
// import { useRouter } from 'next/navigation';

export const LocaleSwitcher = () => {
  // const router = useRouter();
  // const pathname = usePathname();
  const locale = useLocale();

  // const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
  //   router.push(`/${event.target.value}${pathname}`);
  //   router.refresh();
  // };

  return (
    <>
      {routing.locales.map(elt => (
        <button key={elt} type="button" value={elt} disabled={locale === elt} className="toggle-rtl flex items-center w-9 h-9 mr-3 justify-center text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 dark:bg-gray-800 focus:outline-none dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
          {elt.toUpperCase()}
        </button>
      ))}
      {/*
      <select
        defaultValue={locale}
        onChange={handleChange}
        className="border border-gray-300 font-medium focus:outline-hidden focus-visible:ring-3"
        aria-label="lang-switcher"
      >
        {routing.locales.map(elt => (
          <option key={elt} value={elt}>
            {elt.toUpperCase()}
          </option>
        ))}
      </select> */}
    </>
  );
};
