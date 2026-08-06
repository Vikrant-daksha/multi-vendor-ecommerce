import { forwardRef } from 'react';

interface BaseProps {
  label?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea';
  classname?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = 'text', classname, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className=" block font-semibold text-gray-700 mb-1">
            {label}
          </label>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...(props as TextareaProps)}
            className={`w-full border border-gray-600 bg-transparent p-2 rounded text-white ${classname}`}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            {...(props as InputProps)}
            className={`w-full border border-gray-600 bg-transparent p-2 rounded text-white ${classname}`}
          />
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
