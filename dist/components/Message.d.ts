import { type ReactNode } from "react";
import type { Paths } from "type-fest/source/paths.js";
import { z } from "zod/v4";
import type { ZodForms } from "../types.js";
/**
 * Message component
 */
export declare function Message<PayloadType, SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodForms.Components.Message.Props<PayloadType, SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
