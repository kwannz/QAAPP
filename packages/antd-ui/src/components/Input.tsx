import { Input as AntdInput } from 'antd';
import type { InputProps as AntdInputProps, InputRef } from 'antd';
import { forwardRef } from 'react';

export interface InputProps extends AntdInputProps {}

export const Input = forwardRef<InputRef, InputProps>(
  (props, ref) => {
    return (
      <AntdInput
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export const { TextArea, Search, Password } = AntdInput;