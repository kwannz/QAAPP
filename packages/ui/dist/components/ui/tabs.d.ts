import * as React from "react";
interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}
declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}
declare const TabsList: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>;
interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}
declare const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>;
interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}
declare const TabsContent: React.ForwardRefExoticComponent<TabsContentProps & React.RefAttributes<HTMLDivElement>>;
export { Tabs, TabsList, TabsTrigger, TabsContent };
