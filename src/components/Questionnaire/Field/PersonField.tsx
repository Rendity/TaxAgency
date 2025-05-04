import type { RepeatFieldRendererProps } from '../types';
import Button from '@/components/Button';
import React, { useEffect, useRef, useState } from 'react';

export const PersonField = ({ index, value, register, errors, onChange, onClick }: RepeatFieldRendererProps) => {
  const [firstName, setFirstName] = useState(value?.firstName ?? '');
  const [lastName, setLastName] = useState(value?.lastName ?? '');

  const idx = index; // key is used as index

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current({ firstName, lastName });
  }, [firstName, lastName]);

  // useEffect(() => {
  //   onChange({ firstName, lastName });
  // }, [firstName, lastName, onChange]);

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* First Name */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            id={`person_firstname_${idx}`}
            value={firstName}
            {...register(`person.${idx}.firstName`)}
            onChange={e => setFirstName(e.target.value)}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <label
            htmlFor={`person_firstname_${idx}`}
            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
          >
            Vorname
          </label>
          {errors?.person?.[idx]?.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.person[idx].firstName.message}</p>
          )}
        </div>
      </div>

      {/* Last Name */}
      <div className="flex-1 min-w-[200px] relative">
        <div className="relative">
          <input
            type="text"
            id={`person_lastname_${idx}`}
            value={lastName}
            {...register(`person.${idx}.lastName`)}
            onChange={e => setLastName(e.target.value)}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <label
            htmlFor={`person_lastname_${idx}`}
            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
          >
            Nachname
          </label>
          {errors?.person?.[idx]?.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.person[idx].lastName.message}</p>
          )}
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          onClick={() => onClick(idx)}
          className="absolute right-0 top-6 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          label="Remove"
        />
      </div>
    </div>
  );
};

export default PersonField;
