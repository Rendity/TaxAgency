// import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { ReactNode } from 'react';

export type FieldType
  = | 'text'
    | 'email'
    | 'radio'
    | 'checkbox'
    | 'iban'
    | 'creditcard'
    | 'person'
    | 'message'
    | 'multiCheckbox';

export type ButtonType = {
  type: 'button' | 'submit' | 'reset';
  color?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export type RadioType = {
  key: string;
  label: string;
  value: string;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export type TextType = {
  label: string;
  key: string;
  default?: string;
  type: string;
  value: string;
  disabled: boolean;
  name: string;
  onChange: (value: string) => void;
};

export type ValidationRules = {
  required?: { value: boolean; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  validate?: { [key: string]: (value: any) => boolean | string };
  pattern?: { value: RegExp; message: string };
};

export type OptionType = { label: string; value: any };

export type Field = {
  label: string;
  name: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: OptionType[];
  fields?: Field[];
  extraOptions?: OptionType[];
  description?: string | ReactNode;
  validation?: ValidationRules;
};

export type Step = {
  id: number;
  title: string;
  description: string;
  fields: Field[];
};

export type ReviewProps = {
  data: any;
  steps: Step[];
  onSubmit: (data: any) => void;
};

export type QuestionnaireProps = {
  steps: Step[];
  client: number;
  company: string;
  doubleEntry: boolean;
};

export type StepFormProps = {
  step: Step;
  control: any;
  errors: any;
  onNext: () => void;
  onPrevious: () => void;
  setValue: any;
  register: any;
};

export type FieldRendererProps = {
  field: Field;
  value: any;
  uniqueName?: string;
  register: any;
  errors: any;
  onChange: (value: any) => void;
};

export type RepeatFieldRendererProps = {
  key: string;
  index: number;
  field: Field;
  value: any;
  register: any;
  errors: any;
  onChange: (value: any) => void;
  onClick: (value: any) => void;
};

export type PersonFieldProps = {
  firstName: string;
  lastName: string;
};
