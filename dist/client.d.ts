import { type AllHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { type FormProps } from "react-router";
import type { Get, Paths } from "type-fest";
import { z } from "zod";
import { type ZodFormContextType } from "./context";
import type { HandleZodFormMessage } from "./server";
/**
 * Props for the ZodForm component
 */
export interface ZodFormProps<SchemaType extends z.ZodInterface<any>> extends Omit<FormProps, "id"> {
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
     * Whether the field should be read only
     */
    readOnly?: boolean;
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
 * Options for the useZodForms hook
 */
export interface useZodFormOptions<SchemaType extends z.ZodInterface<any>, Intent extends keyof z.infer<SchemaType["def"]["shape"]>> {
    /**
     * The current form intent
     */
    intent: Intent;
    /**
     * The Zod schema used to validate form data
     */
    schema: SchemaType;
}
/**
 * Initialize a new ZodForm instance
 */
export declare function useZodForm<SchemaType extends z.ZodInterface<any>, Intent extends keyof z.infer<SchemaType>, PayloadType = any, IntentSchemaType extends z.ZodInterface<any> = SchemaType["def"]["shape"][Intent]>({ intent, schema, }: useZodFormOptions<SchemaType, Intent>): ZodFormContextType<HandleZodFormMessage<IntentSchemaType, PayloadType>, IntentSchemaType>;
