import * as React from 'react';
interface CheckboxProperties {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProperties & React.RefAttributes<HTMLButtonElement>>;
export { Checkbox };
