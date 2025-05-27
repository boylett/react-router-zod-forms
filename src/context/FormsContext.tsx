import { createContext, useRef, type ReactNode, type RefObject } from "react";
import type { ZodForms } from "../types.js";

/**
 * Context for ZodForms
 */
export const ZodFormsContext = createContext<
  {
    /**
     * The current forums in the document
     */
    forms?: RefObject<Record<string, Partial<ZodForms.Context>>>;
  }
>({});

/**
 * ZodForm context provider
 * 
 * @remarks
 * This should be embedded at the application level. Wrap your `<App />` with `<ZodFormProvider>`.
 */
export function ZodFormProvider ({ children }: { children: ReactNode; }) {
  // Create forms state
  const forms = useRef<Record<string, Partial<ZodForms.Context>>>({});

  return (
    <ZodFormsContext value={ { forms } }>
      { children }
    </ZodFormsContext>
  );
}
