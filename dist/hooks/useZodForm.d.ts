import type { Paths } from "type-fest";
import { z } from "zod";
import { type ZodFormsContextType } from "../context/FormsContext";
import type { HandleZodFormMessage } from "./handleZodForm";
/**
 * Options for the useZodForms hook
 */
export interface useZodFormOptions<SchemaType extends z.ZodInterface<any>, Intent extends keyof z.infer<SchemaType["def"]["shape"]>> {
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
}
export type useZodFormsReturnType<DataType = any, SchemaType extends z.ZodInterface<any> = z.ZodInterface<any>, FieldPath extends Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.infer<SchemaType>, {
    bracketNotation: true;
}>> = Pick<ZodFormsContextType<DataType, SchemaType, FieldPath>, "data" | "id" | "intent" | "load" | "schema" | "state" | "submit" | "validate" | "validation" | "Field" | "Form" | "Message">;
/**
 * Initialize a new Form instance
 */
export declare function useZodForm<SchemaType extends z.ZodInterface<any>, Intent extends keyof z.infer<SchemaType>, PayloadType = any, IntentSchemaType extends z.ZodInterface<any> = SchemaType["def"]["shape"][Intent]>(options: useZodFormOptions<SchemaType, Intent>): useZodFormsReturnType<HandleZodFormMessage<IntentSchemaType, PayloadType>, IntentSchemaType>;
