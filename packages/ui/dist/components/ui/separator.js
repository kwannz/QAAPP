'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';
import { cn } from '../../utils/cn';
const Separator = React.forwardRef(({ className, orientation = 'horizontal', decorative = true, ...properties }, reference) => (_jsx(SeparatorPrimitive.Root, { ref: reference, decorative: decorative, orientation: orientation, className: cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className), ...properties })));
Separator.displayName = SeparatorPrimitive.Root.displayName;
export { Separator };
