import type { Paths } from "type-fest/source/paths.js";
import { z } from "zod/v4";
import type { ZodForms } from "../types.js";
/**
 * Field component
 */
export declare function Field<SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodForms.Components.Field.Props<SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
