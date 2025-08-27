"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";
const Checkbox = React.forwardRef(({ checked = false, onCheckedChange, disabled = false, className, id }, ref) => {
    return (_jsx("button", { ref: ref, type: "button", role: "checkbox", "aria-checked": checked, id: id, disabled: disabled, className: cn("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:cursor-not-allowed disabled:opacity-50", checked && "bg-primary text-primary-foreground", className), onClick: () => onCheckedChange?.(!checked), children: checked && (_jsx(Check, { className: "h-3 w-3", strokeWidth: 3 })) }));
});
Checkbox.displayName = "Checkbox";
export { Checkbox };
