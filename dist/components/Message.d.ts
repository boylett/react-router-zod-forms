import React, { type AllHTMLAttributes, type ElementType, type ReactNode, type RefObject } from "react";
import type { Paths } from "type-fest";
import { z } from "zod";
import type { HandleZodFormMessage } from "../hooks/handleZodForm";
/**
 * Props for the Message component
 */
export interface ZodFormMessageProps<PayloadType, SchemaType extends z.ZodInterface<any>, FieldPath extends Paths<z.infer<SchemaType>, {
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
     */
    children?: (props: AllHTMLAttributes<HTMLElement> & {
        /**
         * Issues relating to this field
         */
        issues?: z.core.$ZodIssue[];
        /**
         * The message to display
         */
        message?: HandleZodFormMessage<SchemaType, PayloadType>;
    }) => ReactNode;
    /**
     * The name of the field in the schema
     */
    name?: FieldPath | `${FieldPath}.*` | "*";
    /**
     * Message element reference
     */
    ref?: RefObject<HTMLElement | null>;
}
export declare function Message<PayloadType, SchemaType extends z.ZodInterface<any>, FieldPath extends Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodFormMessageProps<PayloadType, SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element | null | undefined;
