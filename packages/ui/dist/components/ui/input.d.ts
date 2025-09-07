import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
declare const inputVariants: (props?: ({
    variant?: "default" | "success" | "warning" | "error" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface InputProperties extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
    helper?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    loading?: boolean;
}
declare const Input: React.ForwardRefExoticComponent<InputProperties & React.RefAttributes<HTMLInputElement>>;
export { Input, inputVariants };
