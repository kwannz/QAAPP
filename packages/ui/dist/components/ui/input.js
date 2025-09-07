import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../utils/cn';
const inputVariants = cva('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors', {
    variants: {
        variant: {
            default: '',
            error: 'border-destructive focus-visible:ring-destructive',
            success: 'border-green-500 focus-visible:ring-green-500',
            warning: 'border-yellow-500 focus-visible:ring-yellow-500',
        },
        size: {
            default: 'h-10 px-3 py-2',
            sm: 'h-9 px-2.5 py-1.5 text-xs',
            lg: 'h-11 px-4 py-3',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
const Input = React.forwardRef(({ className, variant, size, type, label, error, helper, leftIcon, rightIcon, loading, ...properties }, reference) => {
    const hasError = error || variant === 'error';
    const inputVariant = hasError ? 'error' : variant;
    return (_jsxs("div", { className: "w-full space-y-2", children: [label && (_jsxs("label", { className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", children: [label, properties.required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] })), _jsxs("div", { className: "relative", children: [leftIcon && (_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: leftIcon })), _jsx("input", { type: type, className: cn(inputVariants({ variant: inputVariant, size }), leftIcon && 'pl-10', rightIcon && 'pr-10', className), disabled: loading || properties.disabled, ref: reference, ...properties }), rightIcon && (_jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: rightIcon }))] }), (error || helper) && (_jsx("p", { className: cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground'), children: error || helper }))] }));
});
Input.displayName = 'Input';
export { Input, inputVariants };
