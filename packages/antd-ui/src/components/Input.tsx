import { Input as AntdInput, type InputProps as AntdInputProperties, type InputRef } from 'antd';
import { forwardRef } from 'react';

export interface InputProperties extends AntdInputProperties {}

export const Input = forwardRef<InputRef, InputProperties>(
  (properties, reference) => {
    return (
      <AntdInput
        ref={reference}
        {...properties}
      />
    );
  },
);

Input.displayName = 'Input';

export const { TextArea, Search, Password } = AntdInput;
