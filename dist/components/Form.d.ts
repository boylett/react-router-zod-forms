import React, { type RefObject } from "react";
import { type FormProps } from "react-router";
import { z } from "zod";
/**
 * Props for the Form component
 */
export interface ZodFormProps<SchemaType extends z.ZodObject<any>> extends FormProps {
    /**
     * Whether to embed the current intent as a hidden field
     *
     * @remarks
     * Defaults to `true`
     */
    intent?: boolean;
    /**
     * Called when data returns from the action
     */
    onResponse?: (data: any) => void;
    /**
     * Called during form data validation
     */
    onValidate?: (data: z.output<SchemaType>, validation: z.ZodSafeParseResult<z.output<SchemaType>>) => void;
    /**
     * Form element reference
     */
    ref?: RefObject<HTMLFormElement | null>;
}
/**
 * Form component
 */
export declare function Form<SchemaType extends z.ZodObject<any>>(props: ZodFormProps<SchemaType>): React.JSX.Element;
