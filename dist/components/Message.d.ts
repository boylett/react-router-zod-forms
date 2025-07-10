import { type ReactNode } from "react";
import { z } from "zod";
import type { SchemaPaths, ZodForms } from "../types.js";
/**
 * Message component
 */
export declare function Message<PayloadType, SchemaType extends z.ZodObject<any>, FieldPath extends SchemaPaths<SchemaType>>(props: ZodForms.Components.Message.Props<PayloadType, SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
