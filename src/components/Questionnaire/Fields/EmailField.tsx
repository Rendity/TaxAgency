import type { TextType } from '../types';
import { useFormContext } from 'react-hook-form';

type EmailType = TextType & {
  type: 'email';
  id: string | undefined;
};

export const EmailField = (textField: EmailType) => {
  const { setError, clearErrors } = useFormContext();
  return (
    <div className="relative">
      <input
        {...textField}
        id={textField.id}
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        onChange={e => textField.onChange(e.target.value)}
        onBlur={async (e) => {
          const email = e.target.value;
          clearErrors(`${textField.id}`);
          if (!email) {
            return;
          }
          fetch(`/api/questionnaire?email=${encodeURIComponent(email)}`)
            .then(async (res) => {
              if (res.status === 400) {
                const err = await res.json();
                setError(`${textField.id}`, {
                  type: 'manual',
                  message: err?.message || 'Email verification failed',
                });
              }
            })
            .catch(() => {
              setError(`${textField.id}`, {
                type: 'manual',
                message: 'Server error during email check',
              });
            });
        }}
      />
      <label htmlFor={`${textField.id}`} className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
        {textField.label}
      </label>
    </div>
  );
};

export default EmailField;
