import React, { useContext, type AllHTMLAttributes, type ElementType, type ReactNode } from "react";
import type { Paths } from "type-fest";
import { z } from "zod";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
import type { HandleZodFormMessage } from "../hooks/handleZodForm";
import { Path } from "../utils/Path";

/**
 * Props for the Message component
 */
export interface ZodFormMessageProps<
  PayloadType,
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
     * Issues relating to this field
     */
    issues?: z.core.$ZodIssue[];

    /**
     * The message to display
     */
    message?: HandleZodFormMessage<SchemaType, PayloadType>;
  }) => ReactNode;

  /**
   * The name of the field in the schema
   */
  name?: FieldPath | `${ FieldPath }.*`;
}

export function Message<
  PayloadType,
  SchemaType extends z.ZodInterface<any>,
  FieldPath extends Paths<z.infer<SchemaType>, { bracketNotation: true; }>,
> (
  props: ZodFormMessageProps<PayloadType, SchemaType, FieldPath>
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

  // Get validation result from context
  const {
    data,
    schema,
    validation,
  } = form;

  // If a field name is not set, display the data message
  if (!name) {
    // If there is not a message
    if (!data?.message && !data?.status) {
      return undefined;
    }

    return (
      children
        ? (
          <>
            { children({ ...rest, message: data }) }
          </>
        )
        : (
          <Element
            data-status={ data.status }
            title={ data.message }
            { ...rest }>
            <p>
              { data.message }
            </p>
          </Element>
        )
    );
  }

  // If validation is not set for this field
  if (!validation || validation.success || validation.error.issues.length === 0) {
    return undefined;
  }

  // Whether this field name is a wildcard
  const wildcard = name.endsWith(".*");

  // Get the field path
  const fieldPath = new Path(name.replace(/\.\*$/, ""));

  // Get the field issues
  const issues = validation.error.issues
    .filter(
      issue =>
        fieldPath.is(issue.path) ||
        (
          wildcard && fieldPath.startsWith(issue.path)
        )
    );

  // If there are no issues for this field
  if (issues.length === 0) {
    return undefined;
  }

  return (
    children
      ? (
        <>
          { children({ ...rest, issues }) }
        </>
      )
      : (
        <Element { ...rest }>
          <ul>
            { issues.map(
              (issue, key) => {
                const fieldSchema: z.ZodType<any> | undefined = schema && fieldPath.toSchema(schema);

                return (
                  <li
                    data-issue-code={ issue.code }
                    key={ key }>
                    <strong>
                      { fieldSchema?.meta()?.description || fieldPath.toString() }
                    </strong>
                    <span>
                      { issue.message }
                    </span>
                  </li>
                );
              }
            )
              .filter(Boolean) }
          </ul>
        </Element>
      )
  );
}