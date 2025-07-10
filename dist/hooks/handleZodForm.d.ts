import { z } from "zod";
import type { ZodForms } from "../types.js";
/**
 * Handle Zod Form submission
 */
export declare function handleZodForm<SchemaType extends z.ZodObject<Record<string, z.ZodObject<any>>>, PayloadTypes extends {
    [key in "default" | keyof SchemaType["_zod"]["def"]["shape"]]?: any;
}>(options: ZodForms.HandleZodForm.Options<SchemaType>, forms: ZodForms.HandleZodForm.Forms<SchemaType, PayloadTypes>, hooks?: ZodForms.HandleZodForm.Hooks<SchemaType>): Promise<Response | ZodForms.Response<any, PayloadTypes["default"]> | ZodForms.Response<SchemaType["_zod"]["def"]["shape"][keyof SchemaType["_zod"]["def"]["shape"]], PayloadTypes[keyof SchemaType["_zod"]["def"]["shape"]]>>;
