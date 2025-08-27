"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../utils/cn";
const TabsContext = React.createContext({
    value: '',
    onValueChange: () => { }
});
const Tabs = React.forwardRef(({ value, onValueChange, children, className }, ref) => {
    return (_jsx(TabsContext.Provider, { value: { value, onValueChange }, children: _jsx("div", { ref: ref, className: cn("w-full", className), children: children }) }));
});
Tabs.displayName = "Tabs";
const TabsList = React.forwardRef(({ children, className }, ref) => {
    return (_jsx("div", { ref: ref, className: cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className), children: children }));
});
TabsList.displayName = "TabsList";
const TabsTrigger = React.forwardRef(({ value, children, className, disabled = false }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;
    return (_jsx("button", { ref: ref, className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", isActive && "bg-background text-foreground shadow-sm", className), disabled: disabled, onClick: () => context.onValueChange(value), children: children }));
});
TabsTrigger.displayName = "TabsTrigger";
const TabsContent = React.forwardRef(({ value, children, className }, ref) => {
    const context = React.useContext(TabsContext);
    if (context.value !== value) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className), children: children }));
});
TabsContent.displayName = "TabsContent";
export { Tabs, TabsList, TabsTrigger, TabsContent };
