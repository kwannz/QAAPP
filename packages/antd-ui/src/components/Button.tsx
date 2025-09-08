import { Button as AntdButton } from 'antd';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';

export interface ButtonProperties
  extends Omit<ComponentPropsWithoutRef<typeof AntdButton>, 'variant'> {
  variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

type ButtonReference = ElementRef<typeof AntdButton>;

const variantMap: Record<NonNullable<ButtonProperties['variant']>, string> = {
  primary: 'primary',
  default: 'default',
  dashed: 'dashed',
  link: 'link',
  text: 'text',
};

export const Button = forwardRef<ButtonReference, ButtonProperties>(
  ({ variant = 'default', ...properties }, reference) => (
    <AntdButton ref={reference} type={variantMap[variant]} {...properties} />
  ),
);

Button.displayName = 'Button';

