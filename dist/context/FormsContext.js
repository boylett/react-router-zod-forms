import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useRef } from "react";
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
    return (_jsx(ZodFormsContext, { value: { forms }, children: children }));
}
//# sourceMappingURL=FormsContext.js.map