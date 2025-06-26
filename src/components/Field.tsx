import { DateTime } from "luxon";
import { useCallback, useContext, type ChangeEventHandler, type FocusEventHandler, type FormEventHandler } from "react";
import { z } from "zod/v4";
import { ZodFormContext } from "../context/FormContext.js";
import { ZodFormsContext } from "../context/FormsContext.js";
import type { SchemaPaths, ZodForms } from "../types.js";
import { Path } from "../utils/Path.js";

/**
 * Field component
 */
export function Field<
  SchemaType extends z.ZodObject<any>,
  FieldPath extends SchemaPaths<SchemaType>,
> (
  props: ZodForms.Components.Field.Props<SchemaType, FieldPath>
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
  } = props as any;

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
  let shape: z.ZodType | undefined = undefined;

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
      // Whether the shape is optional
      const isOptional = shape.safeParse(undefined).success;

      // Whether the shape is nullable
      const isNullable = shape.safeParse(null).success;

      // If the field should be required
      if (!isOptional && !isNullable && !("required" in rest)) {
        // Set the required attribute
        Object.assign(rest, {
          required: true,
        });
      }

      // If the field is optional
      else if (isOptional && "innerType" in shape.def) {
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
            (issue: z.core.$ZodIssue) =>
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
              ...rest,
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
