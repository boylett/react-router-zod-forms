import { useContext, useRef, type ReactNode } from "react";
import { z } from "zod/v4";
import { ZodFormContext } from "../context/FormContext.js";
import { ZodFormsContext } from "../context/FormsContext.js";
import type { SchemaPaths, ZodForms } from "../types.js";
import { Path } from "../utils/Path.js";

/**
 * Message component
 */
export function Message<
  PayloadType,
  SchemaType extends z.ZodObject<any>,
  FieldPath extends SchemaPaths<SchemaType>,
> (
  props: ZodForms.Components.Message.Props<PayloadType, SchemaType, FieldPath>
) {
  let {
    as: Element = "div",
    children,
    className,
    form: formId,
    name,
    ...rest
  } = props;

  // Keep a local copy of the form context in case the message is detached from the DOM
  const localContext = useRef<Partial<ZodForms.Context> | null>(null);

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
  const form = formId && forms?.current?.[ formId ] || localContext.current || undefined;

  // If a form was not found
  if (!form) {
    throw new Error("Could not connect to form context. Check `form` prop or wrap component with a Zod Forms `<Form />` component.");
  }

  // Save local context
  localContext.current ||= form;

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
          (
            children as Exclude<ZodForms.Components.Message.Props.Form<PayloadType, SchemaType>[ "children" ], undefined>
          )(
            {
              ...rest,
              className: `react-router-zod-forms__form-message ${ className || "" }`.trim(),
            },
            schema as any,
            data,
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
        (issue: z.core.$ZodIssue) =>
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
        (
          children as Exclude<ZodForms.Components.Message.Props.Field<SchemaType, FieldPath>[ "children" ], undefined>
        )(
          {
            ...rest,
            className: `react-router-zod-forms__form-message ${ className || "" }`.trim(),
          },
          shape as any,
          issues,
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
                (issue: z.core.$ZodIssue) => {
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