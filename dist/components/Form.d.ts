import React from "react";
import { z } from "zod/v4";
import type { ZodForms } from "../types";
/**
 * Form component
 */
export declare function Form<SchemaType extends z.ZodObject<any>>(props: ZodForms.Components.Form.Props<SchemaType>): React.JSX.Element;
