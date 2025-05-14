import React, { type AllHTMLAttributes, type HTMLInputTypeAttribute, type InputHTMLAttributes, type ReactNode, type RefObject, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { Get, Paths } from "type-fest";
import { z } from "zod";
/**
 * Props for the Field component
 */
export type ZodFormFieldProps<SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>, FieldValue = Get<z.output<SchemaType>, FieldPath>, FieldType = (FieldValue extends boolean ? "hidden" | "image" | "checkbox" | "radio" : FieldValue extends Date ? "hidden" | "image" | "date" | "datetime" | "datetime-local" | "month" | "time" | "week" : FieldValue extends File ? "hidden" | "image" | "file" : FieldValue extends number ? "hidden" | "image" | "number" | "range" : FieldValue extends Array<any> ? "select" : HTMLInputTypeAttribute | "select" | "textarea")> = Omit<FieldValue extends Array<any> ? Omit<SelectHTMLAttributes<HTMLSelectElement>, "defaultValue" | "multiple" | "value"> : Omit<InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>, "defaultValue" | "value">, "children" | "name" | "type"> & {
    /**
     * Renders a custom component for the field with passthrough attributes
     *
     * @param props Element attributes passed through to the component
     * @param shape (optional) The schema for this field
     */
    children?: ReactNode | ((props: AllHTMLAttributes<HTMLElement>, shape: z.ZodType | Record<string, undefined>) => ReactNode);
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
     * Field element reference
     */
    ref?: RefObject<(FieldType extends "select" ? HTMLSelectElement : FieldType extends "textarea" ? HTMLTextAreaElement : HTMLInputElement) | null>;
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
 * Field component
 */
export declare function Field<SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodFormFieldProps<SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element | null | undefined;
