import type { Paths } from "type-fest/source/paths.js";
import { z } from "zod/v4";
import type { ZodForms } from "../types.js";
/**
 * Field component
 */
export declare function Field<SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodForms.Components.Field.Props<SchemaType, FieldPath>): any;
