import * as React from 'react';
interface TabsProperties {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}
declare const Tabs: React.ForwardRefExoticComponent<TabsProperties & React.RefAttributes<HTMLDivElement>>;
interface TabsListProperties {
    children: React.ReactNode;
    className?: string;
}
declare const TabsList: React.ForwardRefExoticComponent<TabsListProperties & React.RefAttributes<HTMLDivElement>>;
interface TabsTriggerProperties {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}
declare const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProperties & React.RefAttributes<HTMLButtonElement>>;
interface TabsContentProperties {
    value: string;
    children: React.ReactNode;
    className?: string;
}
declare const TabsContent: React.ForwardRefExoticComponent<TabsContentProperties & React.RefAttributes<HTMLDivElement>>;
export { Tabs, TabsList, TabsTrigger, TabsContent };
