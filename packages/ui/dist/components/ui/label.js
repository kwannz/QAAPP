import { jsx as _jsx } from "react/jsx-runtime";
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../utils/cn';
const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
const Label = React.forwardRef(({ className, ...properties }, reference) => (_jsx(LabelPrimitive.Root, { ref: reference, className: cn(labelVariants(), className), ...properties })));
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
