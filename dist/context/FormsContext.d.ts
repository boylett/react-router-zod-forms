import { type ReactNode, type RefObject } from "react";
import type { ZodForms } from "../types.js";
/**
 * Context for ZodForms
 */
export declare const ZodFormsContext: import("react").Context<{
    /**
     * The current forums in the document
     */
    forms?: RefObject<Record<string, Partial<ZodForms.Context>>>;
}>;
/**
 * ZodForm context provider
 *
 * @remarks
 * This should be embedded at the application level. Wrap your `<App />` with `<ZodFormProvider>`.
 */
export declare function ZodFormProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
