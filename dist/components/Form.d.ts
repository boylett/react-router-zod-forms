import React from "react";
import { type FormProps } from "react-router";
import { z } from "zod";
/**
 * Props for the Form component
 */
export interface ZodFormProps<SchemaType extends z.ZodInterface<any>> extends FormProps {
    /**
     * Called when data returns from the action
     */
    onResponse?: (data: any) => void;
    /**
     * Called during form data validation
     */
    onValidate?: (data: z.infer<SchemaType>, validation: z.ZodSafeParseResult<z.infer<SchemaType>>) => void;
}
/**
 * Form component
 */
export declare function Form<SchemaType extends z.ZodInterface<any>>(props: ZodFormProps<SchemaType>): React.JSX.Element | undefined;
