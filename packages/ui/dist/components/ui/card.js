import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../utils/cn';
const cardVariants = cva('rounded-lg border bg-card text-card-foreground shadow-sm', {
    variants: {
        variant: {
            default: '',
            elevated: 'shadow-md',
            flat: 'shadow-none border-border/50',
            gradient: 'bg-gradient-to-br from-background to-muted/30',
            glass: 'bg-background/80 backdrop-blur-sm border-white/20',
            // NFT卡片特定样式
            nft: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg hover:shadow-xl transition-shadow',
            premium: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg',
        },
        padding: {
            none: '',
            default: 'p-6',
            sm: 'p-4',
            lg: 'p-8',
        },
    },
    defaultVariants: {
        variant: 'default',
        padding: 'default',
    },
});
const Card = React.forwardRef(({ className, variant, padding, ...properties }, reference) => (_jsx("div", { ref: reference, className: cn(cardVariants({ variant, padding, className })), ...properties })));
Card.displayName = 'Card';
const CardHeader = React.forwardRef(({ className, ...properties }, reference) => (_jsx("div", { ref: reference, className: cn('flex flex-col space-y-1.5 p-6', className), ...properties })));
CardHeader.displayName = 'CardHeader';
const CardTitle = React.forwardRef(({ className, ...properties }, reference) => (_jsx("h3", { ref: reference, className: cn('text-2xl font-semibold leading-none tracking-tight', className), ...properties })));
CardTitle.displayName = 'CardTitle';
const CardDescription = React.forwardRef(({ className, ...properties }, reference) => (_jsx("p", { ref: reference, className: cn('text-sm text-muted-foreground', className), ...properties })));
CardDescription.displayName = 'CardDescription';
const CardContent = React.forwardRef(({ className, ...properties }, reference) => (_jsx("div", { ref: reference, className: cn('p-6 pt-0', className), ...properties })));
CardContent.displayName = 'CardContent';
const CardFooter = React.forwardRef(({ className, ...properties }, reference) => (_jsx("div", { ref: reference, className: cn('flex items-center p-6 pt-0', className), ...properties })));
CardFooter.displayName = 'CardFooter';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
