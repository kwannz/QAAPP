import { Button as AntdButton } from 'antd';
import type { ButtonProps as AntdButtonProps } from 'antd';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<AntdButtonProps, 'variant'> {
  variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', ...props }, ref) => {
    // 映射变体到Ant Design的type
    const antdType = variant === 'primary' ? 'primary' : 
                    variant === 'dashed' ? 'dashed' :
                    variant === 'link' ? 'link' :
                    variant === 'text' ? 'text' : 'default';

    return (
      <AntdButton
        ref={ref}
        type={antdType}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';