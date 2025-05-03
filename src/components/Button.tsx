import type { ButtonType } from './Questionnaire/types';

export const Button = (button: ButtonType) => {
  return (
    // eslint-disable-next-line react-dom/no-missing-button-type
    <button
      {...button}
      className="absolute right-2 top-6 -translate-y-1/2 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
    >
      {button.label}
    </button>
  );
};

export default Button;
