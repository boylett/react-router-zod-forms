import React, { type AllHTMLAttributes, type ElementType, type ReactNode, type RefObject } from "react";
import type { Paths } from "type-fest";
import { z } from "zod/v4";
import type { HandleZodFormMessage } from "../hooks/handleZodForm";
/**
 * Props for the Message component
 */
interface ZodFormMessagePropsNamed<SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> extends Omit<AllHTMLAttributes<HTMLElement>, "as" | "children" | "name"> {
    /**
     * The element type to render
     *
     * @remarks
     * Ignored if `children` prop is supplied.
     */
    as?: ElementType;
    /**
     * Renders a custom component for the message with passthrough attributes
     *
     * @param props Element attributes passed through to the component
     * @param shape (optional) The schema for this field
     */
    children?: (props: AllHTMLAttributes<HTMLElement> & {
        /**
         * Issues relating to this field
         */
        issues: z.core.$ZodIssue[];
    }, shape: z.ZodType | Record<string, undefined>) => ReactNode;
    /**
     * The name of the field in the schema
     */
    name: FieldPath | `${FieldPath}.*` | "*";
    /**
     * Message element reference
     */
    ref?: RefObject<HTMLElement | null>;
}
/**
 * Props for the Message component
 */
interface ZodFormMessagePropsNameless<PayloadType, SchemaType extends z.ZodObject<any>> extends Omit<AllHTMLAttributes<HTMLElement>, "as" | "children" | "name"> {
    /**
     * The element type to render
     *
     * @remarks
     * Ignored if `children` prop is supplied.
     */
    as?: ElementType;
    /**
     * Renders a custom component for the message with passthrough attributes
     *
     * @param props Element attributes passed through to the component
     */
    children?: (props: AllHTMLAttributes<HTMLElement> & {
        /**
         * The message to display
         */
        message: HandleZodFormMessage<SchemaType, PayloadType>;
    }) => ReactNode;
    /**
     * The name of the field in the schema
     */
    name?: never;
    /**
     * Message element reference
     */
    ref?: RefObject<HTMLElement | null>;
}
/**
 * Props for the Message component
 */
export type ZodFormMessageProps<PayloadType, SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = ZodFormMessagePropsNamed<SchemaType, FieldPath> | ZodFormMessagePropsNameless<PayloadType, SchemaType>;
export declare function Message<PayloadType, SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodFormMessageProps<PayloadType, SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element | null | undefined;
export {};
