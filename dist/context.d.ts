import React, { type ReactNode } from "react";
import type { Paths } from "type-fest";
import type z from "zod";
import type { ZodFormFieldProps, ZodFormProps } from "./client";
export type ZodFormContextType<SchemaType extends z.ZodInterface<any> = z.ZodInterface<any>, FieldPath extends Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}>> = {
    /**
     * Fetcher loader data
     */
    data?: any;
    /**
     * The form element
     */
    form?: React.RefObject<HTMLFormElement | null>;
    /**
     * The form's unique identifier
     */
    id: string;
    /**
     * The form's schema intent
     */
    intent: string;
    /**
     * Zod schema for the form
     */
    schema: SchemaType;
    /**
     * Fetcher load state
     */
    state: "idle" | "loading" | "submitting";
    /**
     * Validate the form
     */
    validate: (callback?: (data: z.infer<SchemaType>, validation: z.ZodSafeParseResult<z.core.output<SchemaType>>) => void) => z.ZodSafeParseResult<z.core.output<SchemaType>> | undefined;
    /**
     * Zod validation response
     */
    validation?: z.ZodSafeParseResult<z.core.output<SchemaType>>;
    /**
     * ZodForm component
     */
    ZodForm: (props: ZodFormProps<SchemaType>) => React.JSX.Element;
    /**
     * ZodFormField component
     */
    ZodFormField: (props: ZodFormFieldProps<SchemaType, FieldPath>) => React.JSX.Element;
};
/**
 * Context for ZodForms
 */
export declare const ZodFormContext: React.Context<{
    /**
     * The current forums in the document
     */
    forms?: React.RefObject<Record<string, Partial<ZodFormContextType>>>;
}>;
/**
 * ZodForm context provider
 *
 * @remarks
 * This should be embedded at the application level. Wrap your `<App />` with `<ZodFormProvider>`.
 */
export declare function ZodFormProvider({ children }: {
    children: ReactNode;
}): React.JSX.Element;
