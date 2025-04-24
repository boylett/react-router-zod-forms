import React, { useContext, type AllHTMLAttributes, type ElementType, type ReactNode } from "react";
import type { Paths } from "type-fest";
import { z } from "zod";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";

/**
 * Props for the Message component
 */
export interface ZodFormMessageProps<
  SchemaType extends z.ZodInterface<any>,
  FieldPath extends Paths<z.infer<SchemaType>, { bracketNotation: true; }>,
> extends Omit<
  AllHTMLAttributes<HTMLElement>,
  | "as"
  | "children"
  | "name"
> {
  /**
   * The element type to render
   * 
   * @remarks
   * Ignored if `children` prop is supplied.
   */
  as?: ElementType;

  /**
   * Renders a custom component for the message with passthrough attributes
   * 
   * @param props Element attributes passed through to the component
   */
  children?: (props: AllHTMLAttributes<HTMLElement> & {
    /**
     * Form validation result
     */
    validation?: z.ZodSafeParseResult<z.infer<SchemaType>>;
  }) => ReactNode;

  /**
   * The name of the field in the schema
   */
  name?: FieldPath;
}

export function Message<
  SchemaType extends z.ZodInterface<any>,
  FieldPath extends Paths<z.infer<SchemaType>, { bracketNotation: true; }>,
> (
  props: ZodFormMessageProps<SchemaType, FieldPath>
) {
  let {
    as: Element = "div",
    children,
    form: formId,
    name,
    ...rest
  } = props;

  // Get forms context
  const { forms } = (
    useContext(ZodFormsContext)
  );

  // If there is no context
  if (forms === undefined) {
    throw new Error("`ZodFormsContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
  }

  // Get current form context
  formId ||= (
    useContext(ZodFormContext)
  );

  // If a form was not defined
  if (!formId) {
    throw new Error("Form identifier not supplied. Pass `form` prop or wrap component with a Zod Forms `<Form />` component.");
  }

  // Get the current form
  const form = formId && forms?.current?.[ formId ];

  // If a form was not found
  if (!form) {
    throw new Error("Could not connect to form context. Check `form` prop or wrap component with a Zod Forms `<Form />` component.");
  }

  return (
    children
      ? (
        <>
          { children({ ...rest }) }
        </>
      )
      : (
        <Element { ...rest }>
          <p>
            { JSON.stringify({}) }
          </p>
        </Element>
      )
  );
}