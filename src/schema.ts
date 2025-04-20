import { z } from "zod";

/**
 * Create a new Zod form schema
 */
export function createZodFormSchema<
  SchemaType = Record<string, z.ZodInterface<any>>
> (
  schema: SchemaType,
) {
  return z.interface({
    /**
     * The form's submission intent
     */
    _intent: z.string(),

    ...schema,
  });
}