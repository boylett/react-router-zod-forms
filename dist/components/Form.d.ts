import { z } from "zod/v4";
import type { ZodForms } from "../types.js";
/**
 * Form component
 */
export declare function Form<SchemaType extends z.ZodObject<any>>(props: ZodForms.Components.Form.Props<SchemaType>): import("react/jsx-runtime").JSX.Element;
