import React from "react";
import type { Paths } from "type-fest/source/paths";
import { z } from "zod/v4";
import type { ZodForms } from "../types";
/**
 * Field component
 */
export declare function Field<SchemaType extends z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>>(props: ZodForms.Components.Field.Props<SchemaType, FieldPath>): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element | null | undefined;
