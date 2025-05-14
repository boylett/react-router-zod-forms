import { DateTime } from "luxon";
import React, { useCallback, useContext, type AllHTMLAttributes, type ChangeEventHandler, type FocusEventHandler, type FormEventHandler, type InputHTMLAttributes, type ReactNode, type RefObject, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { Get, Paths } from "type-fest";
import { z } from "zod";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
import { Path } from "../utils/Path";

/**
 * Props for the Field component
 */
export type ZodFormFieldProps<
  SchemaType extends z.ZodInterface<any>,
  FieldPath extends Paths<z.infer<SchemaType>, { bracketNotation: true; }>,
  FieldValue = Get<z.infer<SchemaType>, FieldPath>,
  FieldType = (
    FieldValue extends boolean
    ? "hidden" | "image" | "checkbox" | "radio"
    : FieldValue extends Date
    ? "hidden" | "image" | "date" | "datetime" | "datetime-local" | "month" | "time" | "week"
    : FieldValue extends File
    ? "hidden" | "image" | "file"
    : FieldValue extends number
    ? "hidden" | "image" | "number" | "range"
    : FieldValue extends Array<any>
    ? "select"
    : FieldValue extends object
    ? never
    : InputHTMLAttributes<HTMLInputElement>[ "type" ] | "select" | "textarea"
  )
> = Omit<
  FieldType extends never
  ? never
  : FieldValue extends Array<any>
  ? Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    | "defaultValue"
    | "multiple"
    | "value"
  >
  : Omit<
    InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>,
    | "defaultValue"
    | "value"
  >,
  | "children"
  | "name"
  | "type"
> & {
  /**
   * Renders a custom component for the field with passthrough attributes
   * 
   * @param props Element attributes passed through to the component
   * @param shape (optional) The schema for this field
   */
  children?: ReactNode | (
    (
      props: AllHTMLAttributes<HTMLElement>,
      shape: z.ZodType<any> | Record<string, undefined>
    ) => ReactNode
  );

  /**
   * The default value of this input
   */
  defaultValue?: FieldValue;

  /**
   * The name of the field in the schema
   */
  name?: FieldPath;

  /**
   * Whether the field should be read only
   */
  readOnly?: boolean;

  /**
   * Field element reference
   */
  ref?: RefObject<
    (
      FieldType extends "select"
      ? HTMLSelectElement
      : FieldType extends "textarea"
      ? HTMLTextAreaElement
      : HTMLInputElement
    ) | null
  >;

  /**
   * The type of the field
   */
  type?: FieldType;

  /**
   * The controlled value of this input
   */
  value?: FieldValue;
};

/**
 * Field component
 */
export function Field<
  SchemaType extends z.ZodInterface<any>,
  FieldPath extends Paths<z.infer<SchemaType>, { bracketNotation: true; }>,
> (
  props: ZodFormFieldProps<SchemaType, FieldPath>
) {
  let {
    children,
    className,
    form: formId,
    onBlur,
    onChange,
    onInput,
    type = "text",
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

  // If a form schema was not found
  if (!form?.schema) {
    throw new Error("Could not connect to form context. Check `form` prop or wrap component with a Zod Forms `<Form />` component.");
  }

  // Get form data
  const {
    data,
    events,
    schema,
    validation,
  } = form;

  // The schema for this field
  let shape: z.ZodType<any> | undefined = undefined;

  // If the field is not hidden, make it focusable with keyboard shortcuts
  if (type !== "hidden" && !("tabIndex" in rest)) {
    rest.tabIndex ||= 0;
  }

  // If the input has a name
  if (rest.name) {
    // Create a new path
    const path = new Path(rest.name);

    // Get the default value from the current action data
    const defaultValue = path.pickFrom(
      data?.validation?.data
    );

    // If the default value exists
    if (defaultValue !== undefined) {
      // Populate it on the field
      rest.defaultValue = defaultValue;
    }

    // Get the field schema
    shape = path.toSchema(schema);

    // If we found the shape for this field
    if (shape) {
      // If the field should be required
      if (!shape.isOptional() && !shape.isNullable() && !("required" in rest)) {
        // Set the required attribute
        Object.assign(rest, {
          required: true,
        });
      }

      // If the field is optional
      else if (shape.isOptional() && "innerType" in shape.def) {
        shape = shape.def.innerType as z.ZodType<any, any>;
      }

      // If the field has a max date
      if ("maxDate" in shape && !("max" in rest)) {
        // Set the max date of the field
        Object.assign(rest, {
          max: DateTime
            .fromJSDate(new Date(shape.maxDate as string))
            .toFormat(
              type === "datetime-local"
                ? "yyyy-MM-dd'T'HH:mm"
                : type === "time"
                  ? "HH:mm"
                  : type === "week"
                    ? "yyyy-'W'W"
                    : type === "month"
                      ? "yyyy-MM"
                      : "yyyy-MM-dd"
            ),
        });
      }

      // If the field has a min date
      if ("minDate" in shape && !("min" in rest)) {
        // Set the min date of the field
        Object.assign(rest, {
          min: DateTime
            .fromJSDate(new Date(shape.minDate as string))
            .toFormat(
              type === "datetime-local"
                ? "yyyy-MM-dd'T'HH:mm"
                : type === "time"
                  ? "HH:mm"
                  : type === "week"
                    ? "yyyy-'W'W"
                    : type === "month"
                      ? "yyyy-MM"
                      : "yyyy-MM-dd"
            ),
        });
      }

      // If the field has a max length
      if ("maxLength" in shape && !("max" in rest)) {
        // Set the max length of the field
        Object.assign(rest, {
          [
            shape.def.type === "string"
              ? "maxLength"
              : "max"
          ]: shape.maxLength,
        });
      }

      // If the field has a min length
      if ("minLength" in shape && !("min" in rest)) {
        // Set the min length of the field
        Object.assign(rest, {
          [
            shape.def.type === "string"
              ? "minLength"
              : "min"
          ]: shape.minLength,
        });
      }

      if (
        (
          // If the field is an integer
          (shape.def.type === "number" && "format" in shape.def && shape.def.format === "safeint") ||
          // If the field is a datetime
          type === "date"
        ) && !(
          "step" in rest
        )
      ) {
        // Set the field step count to 1
        Object.assign(rest, {
          step: 1,
        });
      }

      // If the field is a month
      if (type === "month" && !("step" in rest)) {
        // Set the field step count to 12
        Object.assign(rest, {
          step: 12,
        });
      }

      // Look through the field's checks
      for (const check of shape.def.checks || []) {
        // If the field has a regex pattern
        if ("format" in check._zod.def && check._zod.def.format === "regex" && "pattern" in check._zod.def && !("pattern" in rest)) {
          // Set the pattern attribute
          Object.assign(rest, {
            // Remove the first `/` and trailing `/` and flags as HTML does not allow them
            pattern: String(check._zod.def.pattern).substring(1).replace(/\/([a-z]+)?$/i, ""),
          });
        }
      }

      // If there are validation issues
      if (validation?.error?.issues?.length) {
        // Get the field issues
        const issues = validation.error.issues
          .filter(
            issue =>
              path.is(issue.path)
          );

        // If the field has issues
        if (issues.length > 0) {
          Object.assign(rest, {
            "aria-invalid": true,
          });
        }
      }
    }
  }

  /**
   * Validate the form on blur
   */
  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    event => {
      onBlur?.(event as any);

      // If the event has been cancelled, do not validate
      if (event.defaultPrevented) {
        return;
      }

      // If the form exists, trigger a synthetic validation event
      if (form?.form && events?.includes("blur")) {
        const event = new CustomEvent("$ZodForms.externalFieldValidate");

        form.form.current?.dispatchEvent(event);
      }
    },
    [ onBlur ]
  );

  /**
   * Validate the form on change
   */
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    event => {
      onChange?.(event as any);

      // If the event has been cancelled, do not validate
      if (event.defaultPrevented) {
        return;
      }

      // If the form exists, trigger a synthetic validation event
      if (form?.form && events?.includes("change")) {
        const event = new CustomEvent("$ZodForms.externalFieldValidate");

        form.form.current?.dispatchEvent(event);
      }
    },
    [ onChange ]
  );

  /**
   * Validate the form on input
   */
  const handleInput = useCallback<FormEventHandler<HTMLInputElement>>(
    event => {
      onInput?.(event as any);

      // If the event has been cancelled, do not validate
      if (event.defaultPrevented) {
        return;
      }

      // If the form exists, trigger a synthetic validation event
      if (form?.form && events?.includes("input")) {
        const event = new CustomEvent("$ZodForms.externalFieldValidate");

        form.form.current?.dispatchEvent(event);
      }
    },
    [ onInput ]
  );

  return (
    children
      ? typeof children === "function"
        ? (
          children(
            {
              ...rest as any,
              className: `react-router-zod-forms__field ${ className || "" }`.trim(),
              onBlur: handleBlur,
              onChange: handleChange,
              onInput: handleInput,
              type,
            },
            shape || {}
          )
        )
        : (
          <select
            className={
              `react-router-zod-forms__field ${ className || "" }`.trim()
            }
            multiple
            onBlur={ handleBlur }
            onChange={ handleChange }
            onInput={ handleInput }
            { ...rest as any }>
            { children }
          </select>
        )
      : type === "textarea"
        ? (
          <textarea
            className={
              `react-router-zod-forms__field ${ className || "" }`.trim()
            }
            onBlur={ handleBlur }
            onChange={ handleChange }
            onInput={ handleInput }
            { ...rest as any } />
        )
        : (
          <input
            className={
              `react-router-zod-forms__field ${ className || "" }`.trim()
            }
            onBlur={ handleBlur }
            onChange={ handleChange }
            onInput={ handleInput }
            type={ type }
            { ...rest as any } />
        )
  );
}
