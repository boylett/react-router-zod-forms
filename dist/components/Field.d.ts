import { z } from "zod/v4";
import type { SchemaPaths, ZodForms } from "../types.js";
/**
 * Field component
 */
export declare function Field<SchemaType extends z.ZodObject<any>, FieldPath extends SchemaPaths<SchemaType>>(props: ZodForms.Components.Field.Props<SchemaType, FieldPath>): any;
