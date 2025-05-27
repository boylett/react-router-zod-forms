import { z } from "zod/v4";
import type { ZodForms } from "../types";
/**
 * Handle Zod Form submission
 */
export declare function handleZodForm<SchemaType extends z.ZodObject<Record<string, z.ZodObject<any>>>, PayloadTypes extends {
    [key in "default" | keyof SchemaType["_zod"]["def"]["shape"]]?: any;
}>(options: ZodForms.HandleZodForm.Options<SchemaType>, forms: ZodForms.HandleZodForm.Forms<SchemaType, PayloadTypes>, hooks?: ZodForms.HandleZodForm.Hooks<SchemaType>): Promise<Response | ZodForms.Response<any, PayloadTypes["default"]> | ZodForms.Response<SchemaType["_zod"]["def"]["shape"][keyof SchemaType["_zod"]["def"]["shape"]], PayloadTypes[keyof SchemaType["_zod"]["def"]["shape"]]>>;
