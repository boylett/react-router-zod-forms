import { createContext } from "react";

/**
 * Context for the current ZodForm
 */
export const ZodFormContext = createContext<string | undefined>(undefined);
