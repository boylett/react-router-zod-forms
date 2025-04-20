import { z } from "zod";
/**
 * Create a new Zod form schema
 */
export function createZodFormSchema(schema) {
    return z.interface({
        /**
         * The form's submission intent
         */
        _intent: z.string(),
        ...schema,
    });
}
