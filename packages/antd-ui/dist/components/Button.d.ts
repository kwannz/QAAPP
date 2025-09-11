import { type ButtonProps as AntdButtonProperties } from 'antd';
export interface ButtonProperties extends Omit<AntdButtonProperties, 'variant'> {
    variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProperties & import("react").RefAttributes<HTMLAnchorElement | HTMLButtonElement>>;
//# sourceMappingURL=Button.d.ts.map