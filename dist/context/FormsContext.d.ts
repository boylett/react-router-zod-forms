import React, { type ReactNode } from "react";
import type { ZodForms } from "../types";
/**
 * Context for ZodForms
 */
export declare const ZodFormsContext: React.Context<{
    /**
     * The current forums in the document
     */
    forms?: React.RefObject<Record<string, Partial<ZodForms.Context>>>;
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
