import { type AllHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { type FormProps } from "react-router";
import type { Get, Paths } from "type-fest";
import { z } from "zod";
import { type ZodFormContextType } from "./context";
/**
 * Props for the ZodForm component
 */
export interface useZodFormProps<SchemaType extends z.ZodInterface<any>> {
    /**
     * The Zod schema used to validate form data
     */
    schema: SchemaType;
}
/**
 * Props for the ZodForm component
 */
export interface ZodFormProps<SchemaType extends z.ZodInterface<any>> extends Omit<FormProps, "id"> {
    /**
     * Called during form data validation
     */
    onValidate?: (data: z.infer<SchemaType>, validation: z.ZodSafeParseResult<z.core.output<SchemaType>>) => void;
}
/**
 * Props for the ZodFormField component
 */
export type ZodFormFieldProps<SchemaType extends z.ZodInterface<any>, FieldPath extends Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}>, FieldValue = Get<z.infer<SchemaType>, FieldPath>, FieldType = (FieldValue extends boolean ? "hidden" | "image" | "checkbox" | "radio" : FieldValue extends Date ? "hidden" | "image" | "date" | "datetime" | "datetime-local" | "month" | "time" | "week" : FieldValue extends File ? "hidden" | "image" | "file" : FieldValue extends number ? "hidden" | "image" | "number" | "range" : FieldValue extends Array<any> ? "select" : FieldValue extends object ? never : InputHTMLAttributes<HTMLInputElement>["type"] | "select" | "textarea")> = Omit<FieldType extends never ? never : FieldValue extends Array<any> ? Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "defaultValue" | "multiple" | "value"> & {
    /**
     * The multiple select element requires at least one child node
     */
    children: Exclude<SelectHTMLAttributes<HTMLSelectElement>["children"], null | undefined>;
} : Omit<InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>, "children" | "defaultValue" | "value"> & {
    /**
     * Renders a custom component for the field with passthrough attributes
     *
     * @param props Element attributes passed through to the component
     */
    children?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode;
}, "name" | "type"> & {
    /**
     * The default value of this input
     */
    defaultValue?: FieldValue;
    /**
     * The name of the field in the schema
     */
    name?: FieldPath;
    /**
     * The type of the field
     */
    type?: FieldType;
    /**
     * The controlled value of this input
     */
    value?: FieldValue;
};
/**
 * Initialize a new ZodForm instance
 */
export declare function useZodForm<SchemaType extends z.ZodInterface<any>>({ schema }: useZodFormProps<SchemaType>): Record<string, ZodFormContextType<SchemaType["def"]["shape"][Extract<keyof z.core.output<SchemaType>, string>]>>;
