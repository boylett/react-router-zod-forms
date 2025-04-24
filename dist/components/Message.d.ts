import React, { type AllHTMLAttributes, type ElementType, type ReactNode } from "react";
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
        /**
         * Form validation result
         */
        validation?: z.ZodSafeParseResult<z.infer<SchemaType>>;
    }) => ReactNode;
    /**
     * The name of the field in the schema
     */
    name?: FieldPath;
}
export declare function Message<PayloadType, SchemaType extends z.ZodInterface<any>, FieldPath extends Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodFormMessageProps<PayloadType, SchemaType, FieldPath>): React.JSX.Element | undefined;
