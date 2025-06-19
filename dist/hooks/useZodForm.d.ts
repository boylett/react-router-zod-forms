import { z } from "zod/v4";
import type { ZodForms } from "../types.js";
/**
 * Initialize a new Form instance
 */
export declare function useZodForm<SchemaType extends z.ZodObject<any>, PayloadType, Intent extends keyof z.output<SchemaType>, IntentSchemaType extends z.ZodObject<any> = SchemaType["_zod"]["def"]["shape"][Intent]>(options: ZodForms.UseZodForm.Options.Fetcher<SchemaType, Intent>): ZodForms.UseZodForm.Fetcher<ZodForms.Response<IntentSchemaType, PayloadType>, IntentSchemaType>;
/**
 * Initialize a new Form instance
 */
export declare function useZodForm<SchemaType extends z.ZodObject<any>, PayloadType, Intent extends keyof z.output<SchemaType>, IntentSchemaType extends z.ZodObject<any> = SchemaType["_zod"]["def"]["shape"][Intent]>(options: ZodForms.UseZodForm.Options.Form<SchemaType, Intent>): ZodForms.UseZodForm.Form<ZodForms.Response<IntentSchemaType, PayloadType>, IntentSchemaType>;
