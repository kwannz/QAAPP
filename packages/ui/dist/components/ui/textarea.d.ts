import * as React from 'react';
export interface TextareaProperties extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProperties & React.RefAttributes<HTMLTextAreaElement>>;
export { Textarea };
