import type { Paths } from "type-fest";
import { z } from "zod";
import { type ZodFormsContextType, type ZodFormsContextTypeFetcher, type ZodFormsContextTypeForm } from "../context/FormsContext";
import type { HandleZodFormMessage } from "./handleZodForm";
/**
 * Options for the useZodForms hook
 */
interface useZodFormOptionsFetcher<SchemaType extends z.ZodObject<any>, Intent extends keyof z.output<SchemaType["_zod"]["def"]["shape"]>> {
    /**
     * Configure which events trigger validation
     *
     * @remarks
     * Defaults to `[ "blur", "form.submit" ]`
     */
    events?: ZodFormsContextType["events"];
    /**
     * The current form intent
     */
    intent: Intent;
    /**
     * The Zod schema used to validate form data
     */
    schema: SchemaType;
    /**
     * Whether to use a fetcher for this form
     *
     * @remarks
     * Defaults to `false`.
     */
    useFetcher: true;
}
/**
 * Options for the useZodForms hook
 */
interface useZodFormOptionsForm<SchemaType extends z.ZodObject<any>, Intent extends keyof z.output<SchemaType["_zod"]["def"]["shape"]>> {
    /**
     * Configure which events trigger validation
     *
     * @remarks
     * Defaults to `[ "blur", "form.submit" ]`
     */
    events?: ZodFormsContextType["events"];
    /**
     * The current form intent
     */
    intent: Intent;
    /**
     * The Zod schema used to validate form data
     */
    schema: SchemaType;
    /**
     * Whether to use a fetcher for this form
     *
     * @remarks
     * Defaults to `false`.
     */
    useFetcher?: false;
}
/**
 * Options for the useZodForms hook
 */
export type useZodFormOptions<SchemaType extends z.ZodObject<any>, Intent extends keyof z.output<SchemaType["_zod"]["def"]["shape"]>> = useZodFormOptionsFetcher<SchemaType, Intent> | useZodFormOptionsForm<SchemaType, Intent>;
/**
 * Return type of the useZodForm hook
 */
type useZodFormsReturnTypeFetcher<DataType = any, SchemaType extends z.ZodObject<any> = z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = Pick<ZodFormsContextTypeFetcher<DataType, SchemaType, FieldPath>, "data" | "id" | "intent" | "load" | "schema" | "state" | "submit" | "validate" | "validation" | "Field" | "Form" | "Message">;
/**
 * Return type of the useZodForm hook
 */
type useZodFormsReturnTypeForm<DataType = any, SchemaType extends z.ZodObject<any> = z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = Pick<ZodFormsContextTypeForm<DataType, SchemaType, FieldPath>, "data" | "id" | "intent" | "schema" | "state" | "validate" | "validation" | "Field" | "Form" | "Message">;
/**
 * Return type of the useZodForm hook
 */
export type useZodFormsReturnType<DataType = any, SchemaType extends z.ZodObject<any> = z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = useZodFormsReturnTypeFetcher<DataType, SchemaType, FieldPath> | useZodFormsReturnTypeForm<DataType, SchemaType, FieldPath>;
/**
 * Initialize a new Form instance
 */
export declare function useZodForm<SchemaType extends z.ZodObject<any>, Intent extends keyof z.output<SchemaType>, PayloadType = any, IntentSchemaType extends z.ZodObject<any> = SchemaType["_zod"]["def"]["shape"][Intent]>(options: useZodFormOptionsFetcher<SchemaType, Intent>): useZodFormsReturnTypeFetcher<HandleZodFormMessage<IntentSchemaType, PayloadType>, IntentSchemaType>;
/**
 * Initialize a new Form instance
 */
export declare function useZodForm<SchemaType extends z.ZodObject<any>, Intent extends keyof z.output<SchemaType>, PayloadType = any, IntentSchemaType extends z.ZodObject<any> = SchemaType["_zod"]["def"]["shape"][Intent]>(options: useZodFormOptionsForm<SchemaType, Intent>): useZodFormsReturnTypeForm<HandleZodFormMessage<IntentSchemaType, PayloadType>, IntentSchemaType>;
export {};
