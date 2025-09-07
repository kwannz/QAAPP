import type { ButtonProps as AntdButtonProps } from 'antd';
export interface ButtonProps extends Omit<AntdButtonProps, 'variant'> {
    variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=Button.d.ts.map