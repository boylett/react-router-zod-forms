import { z } from "zod";
/**
 * Create a new Zod form schema
 */
export declare function createZodFormSchema<SchemaType = Record<string, z.ZodInterface<any>>>(schema: SchemaType): z.ZodInterface<{
    /**
     * The form's submission intent
     */
    _intent: z.ZodString;
} & SchemaType extends infer T extends object ? { [k in keyof T as k extends `${infer K}?` ? K : k extends `?${infer K_1}` ? K_1 : k]: ({
    /**
     * The form's submission intent
     */
    _intent: z.ZodString;
} & SchemaType)[k]; } : never, {
    optional: z.core.util.OptionalInterfaceKeys<keyof SchemaType>;
    defaulted: z.core.util.DefaultedInterfaceKeys<keyof SchemaType>;
    extra: {};
}>;
