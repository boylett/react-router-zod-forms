import React, { createContext, useRef } from "react";
/**
 * Context for ZodForms
 */
export const ZodFormsContext = createContext({});
/**
 * ZodForm context provider
 *
 * @remarks
 * This should be embedded at the application level. Wrap your `<App />` with `<ZodFormProvider>`.
 */
export function ZodFormProvider({ children }) {
    // Create forms state
    const forms = useRef({});
    return (React.createElement(ZodFormsContext, { value: { forms } }, children));
}
