import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../utils/cn';
const alertVariants = cva('relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7', {
    variants: {
        variant: {
            default: 'bg-background text-foreground',
            destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
const Alert = React.forwardRef(({ className, variant, ...properties }, reference) => (_jsx("div", { ref: reference, role: "alert", className: cn(alertVariants({ variant }), className), ...properties })));
Alert.displayName = 'Alert';
const AlertTitle = React.forwardRef(({ className, ...properties }, reference) => (_jsx("h5", { ref: reference, className: cn('mb-1 font-medium leading-none tracking-tight', className), ...properties })));
AlertTitle.displayName = 'AlertTitle';
const AlertDescription = React.forwardRef(({ className, ...properties }, reference) => (_jsx("div", { ref: reference, className: cn('text-sm [&_p]:leading-relaxed', className), ...properties })));
AlertDescription.displayName = 'AlertDescription';
export { Alert, AlertTitle, AlertDescription, alertVariants };
