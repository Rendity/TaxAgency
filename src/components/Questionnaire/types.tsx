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
    | 'multiCheckbox'
    | 'paymentProviders'
    | 'cashDeskSystem';

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

export type OptionType = { label: string; value: any; tooltip?: string };

export type ShowWhenConditionLeaf
  = | { field: string; value: string; exists?: never; or?: never }
    | { field: string; exists: true; value?: never; or?: never };

/** OR-condition: visible when at least one of the sub-conditions is true */
export type ShowWhenConditionOr = { or: ShowWhenConditionLeaf[]; field?: never; value?: never; exists?: never };

export type ShowWhenCondition = ShowWhenConditionLeaf | ShowWhenConditionOr;

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
  showWhen?: ShowWhenCondition | ShowWhenCondition[];
  translations?: Record<string, string>;
  /** For 'iban' type: the form field name to watch to activate the list */
  triggerField?: string;
  /** For 'iban' type: the value of triggerField that activates the list */
  triggerValue?: string;
  /** For 'iban' type: label for the add button */
  addLabel?: string;
  /** For 'iban' type: show advisor name + contact fields inside each card */
  withAdvisor?: boolean;
  /** For 'iban' type: label for the advisor name input */
  advisorNameLabel?: string;
  /** For 'iban' type: label for the advisor contact input */
  advisorContactLabel?: string;
};

export type Step = {
  id: number;
  title: string;
  sidebarTitle?: string;
  displayTitle?: ReactNode;
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
  companyType?: string;
};

export type StepFormProps = {
  step: Step;
  control: any;
  errors: any;
  onNext: () => void;
  onPrevious: () => void;
  setValue: any;
  register: any;
  validationAttempted?: boolean;
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
