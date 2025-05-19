import React, { useContext, type AllHTMLAttributes, type ElementType, type ReactNode, type RefObject } from "react";
import type { Paths } from "type-fest";
import { z } from "zod/v4";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
import type { HandleZodFormMessage } from "../hooks/handleZodForm";
import { Path } from "../utils/Path";

/**
 * Props for the Message component
 */
interface ZodFormMessagePropsNamed<
  SchemaType extends z.ZodObject<any>,
  FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }>,
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
   * @param shape (optional) The schema for this field
   */
  children?: (
    props: AllHTMLAttributes<HTMLElement> & {
      /**
       * Issues relating to this field
       */
      issues: z.core.$ZodIssue[];
    },
    shape: z.ZodType | Record<string, undefined>
  ) => ReactNode;

  /**
   * The name of the field in the schema
   */
  name: FieldPath | `${ FieldPath }.*` | "*";

  /**
   * Message element reference
   */
  ref?: RefObject<HTMLElement | null>;
}

/**
 * Props for the Message component
 */
interface ZodFormMessagePropsNameless<
  PayloadType,
  SchemaType extends z.ZodObject<any>,
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
     * The message to display
     */
    message: HandleZodFormMessage<SchemaType, PayloadType>;
  }) => ReactNode;

  /**
   * The name of the field in the schema
   */
  name?: never;

  /**
   * Message element reference
   */
  ref?: RefObject<HTMLElement | null>;
}

/**
 * Props for the Message component
 */
export type ZodFormMessageProps<
  PayloadType,
  SchemaType extends z.ZodObject<any>,
  FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }>,
> = ZodFormMessagePropsNamed<
  SchemaType,
  FieldPath
> | ZodFormMessagePropsNameless<
  PayloadType,
  SchemaType
>;

export function Message<
  PayloadType,
  SchemaType extends z.ZodObject<any>,
  FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }>,
> (
  props: ZodFormMessageProps<PayloadType, SchemaType, FieldPath>
) {
  let {
    as: Element = "div",
    children,
    className,
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

  // The schema for this field
  let shape: z.ZodType<unknown, unknown> | undefined = undefined;

  // If a field name is set
  if (name && schema) {
    // Create a new path
    const path = new Path(name);

    // Get the field schema
    shape = path.toSchema(schema);
  }

  // If a field name is not set
  if (!name) {
    // If there is not a message
    if (!data?.message && !data?.status) {
      return undefined;
    }

    return (
      children
        ? (
          children(
            {
              ...rest,
              className: `react-router-zod-forms__form-message ${ className || "" }`.trim(),
              message: data,
            } as any,
            shape || {}
          ) as ReactNode
        )
        : (
          <Element
            className={
              `react-router-zod-forms__form-message ${ className || "" }`.trim()
            }
            data-status={ data.status }
            title={
              data.status >= 400 && data.payload && data.payload instanceof Error
                ? data.payload.message
                : data.message
            }
            { ...rest }>
            <p>
              {
                data.status >= 400 && data.payload && data.payload instanceof Error
                  ? data.payload.message
                  : data.message
              }
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
  const wildcard = name.endsWith(".*") || name === "*";

  // Get the field path
  const fieldPath = new Path(name.replace(/\.\*$/, ""));

  // Get the field issues
  const issues = name === "*"
    ? validation.error.issues
    : validation.error.issues
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
        children(
          {
            ...rest,
            className: `react-router-zod-forms__form-message ${ className || "" }`.trim(),
            issues,
          } as any,
          shape || {}
        ) as ReactNode
      )
      : (
        <Element
          className={
            `react-router-zod-forms__field-message ${ className || "" }`.trim()
          }
          { ...rest }>
          <ul>
            { issues
              .filter(Boolean)
              .map(
                issue => {
                  // Get the field path
                  const fieldPath = new Path(issue.path);

                  // Get the field schema
                  const fieldSchema: z.ZodType | undefined = schema && fieldPath.toSchema(schema);

                  return (
                    <li
                      data-issue-code={ issue.code }
                      key={ `${ issue.path }${ issue.code }` }>
                      <strong>
                        { fieldSchema?.meta()?.description || fieldPath.toPrettyString() }
                      </strong>
                      <span>
                        { issue.message }
                      </span>
                    </li>
                  );
                }
              ) }
          </ul>
        </Element>
      )
  );
}