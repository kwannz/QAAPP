import { Button as AntdButton, type ButtonProps as AntdButtonProperties } from 'antd';
import { forwardRef, type ElementRef } from 'react';

export interface ButtonProperties extends Omit<AntdButtonProperties, 'variant'> {
  variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

export const Button = forwardRef<ElementRef<typeof AntdButton>, ButtonProperties>(
  ({ variant = 'default', ...properties }, reference) => {
    let antdType: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    switch (variant) {
      case 'default': {
        antdType = 'default';
        break;
      }
      case 'primary': {
        antdType = 'primary';
        break;
      }
      case 'dashed': {
        antdType = 'dashed';
        break;
      }
      case 'link': {
        antdType = 'link';
        break;
      }
      case 'text': {
        antdType = 'text';
        break;
      }
      default: {
        antdType = 'default';
      }
    }

    return (
      <AntdButton
        ref={reference}
        type={antdType}
        {...properties}
      />
    );
  },
);

Button.displayName = 'Button';
