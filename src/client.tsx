import { DateTime } from "luxon";
import React, { useCallback, useContext, useEffect, useId, useRef, useState, type AllHTMLAttributes, type FocusEventHandler, type FormEventHandler, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useActionData, useFetcher, type FormProps } from "react-router";
import type { Get, Paths } from "type-fest";
import { z } from "zod";
import { ZodFormContext, type ZodFormContextType } from "./context";
import { formDataToObject } from "./utils/formDataToObject";
import { Path } from "./utils/path";

/**
 * Props for the ZodForm component
 */
export interface ZodFormProps<
  SchemaType extends z.ZodInterface<any>
> extends Omit<
  FormProps,
  | "id"
> {
  /**
   * Called when data returns from the action
   */
  onResponse?: (data: any) => void;

  /**
   * Called during form data validation
   */
  onValidate?: (data: z.infer<SchemaType>, validation: z.ZodSafeParseResult<z.infer<SchemaType>>) => void;
}

/**
 * Props for the ZodFormField component
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
    | "children"
    | "defaultValue"
    | "multiple"
    | "value"
  > & {
    /**
     * The multiple select element requires at least one child node
     */
    children: Exclude<SelectHTMLAttributes<HTMLSelectElement>[ "children" ], null | undefined>;
  }
  : Omit<
    InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>,
    | "children"
    | "defaultValue"
    | "value"
  > & {
    /**
     * Renders a custom component for the field with passthrough attributes
     * 
     * @param props Element attributes passed through to the component
     */
    children?: (props: AllHTMLAttributes<HTMLElement>) => ReactNode;
  },
  | "name"
  | "type"
> & {
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
   * The type of the field
   */
  type?: FieldType;

  /**
   * The controlled value of this input
   */
  value?: FieldValue;
};

/**
 * Options for the useZodForms hook
 */
export interface useZodFormOptions<
  SchemaType extends z.ZodInterface<any>,
  Intent extends keyof z.infer<SchemaType[ "def" ][ "shape" ]>,
> {
  /**
   * The current form intent
   */
  intent: Intent;

  /**
   * The Zod schema used to validate form data
   */
  schema: SchemaType;
}

/**
 * Initialize a new ZodForm instance
 */
export function useZodForm<
  SchemaType extends z.ZodInterface<any>,
  Intent extends keyof z.infer<SchemaType>,
  IntentSchemaType extends z.ZodInterface<any> = SchemaType[ "def" ][ "shape" ][ Intent ],
> (
  {
    intent,
    schema,
  }: useZodFormOptions<SchemaType, Intent>
): ZodFormContextType<IntentSchemaType> {
  // Get the zod form context
  const { forms } = useContext(ZodFormContext);

  // If there is no context
  if (forms === undefined) {
    throw new Error("`ZodFormContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
  }

  // If the intent is empty
  if (!intent || !(intent in schema.def.shape)) {
    throw new Error("Intent not supplied.");
  }

  // Get the intent schema
  const intentSchema: IntentSchemaType = schema.def.shape[ intent ];

  // Create a unique ID for this form
  const formId = useId();

  // Get action data
  const actionData = (
    useActionData<any>()
  );

  // Create the React Router fetcher for this form
  const { data, Form: FetcherForm, load, state, submit } = (
    useFetcher()
  );

  /**
   * Validate the form data against the schema
   */
  const validate = useCallback(
    (callback?: (data: z.infer<IntentSchemaType>, validation: z.ZodSafeParseResult<z.infer<IntentSchemaType>>) => void) => {
      // Get the form element by ID
      const form: HTMLFormElement | null = document.querySelector(`form[id="${ formId.replace(/\"/g, "\\\"") }"]`);

      if (form) {
        const data = formDataToObject(
          form,
          (key, value) => {
            // Get the input for this key
            const input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = (
              form.querySelector(`[name="${ key.replace(/\"/g, "\\\"") }"][type]`) ||
              document.querySelector(`[form="${ formId.replace(/\"/g, "\\\"") }"][name="${ key.replace(/\"/g, "\\\"") }"][type]`)
            );

            // Automatically coerce strings to numbers for inputs with number type
            if (input?.type === "number" && String(value).trim().match(/^-?[e\d]+(\.[e\d]+)?$/)) {
              return parseFloat(
                String(value)
              );
            }

            return value;
          }
        );

        const validation = intentSchema.safeParse(data);

        callback?.(data, validation);

        return validation;
      }
    },
    [ intentSchema ]
  );

  /**
   * ZodForm component
   */
  function Form (
    props: ZodFormProps<IntentSchemaType>
  ) {
    const {
      children,
      onBlur,
      onInput,
      onResponse,
      onValidate,
      ...rest
    } = props;

    // Get form context
    const { forms } = (
      useContext(ZodFormContext)
    );

    // If there is no context
    if (forms === undefined) {
      throw new Error("`ZodFormContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
    }

    // Create a new form reference
    const formRef = useRef<HTMLFormElement>(null);

    // Get the current form
    const form = formId && forms?.current?.[ formId ] || undefined;

    // Assign the reference to context
    if (form) {
      forms.current[ formId ].form = formRef;
    }

    // Current validation state
    const [ validation, setValidation ] = useState<z.ZodSafeParseResult<z.infer<IntentSchemaType>> | undefined>(undefined);

    /**
     * Validate the form on blur
     */
    const handleBlur = useCallback<FocusEventHandler<HTMLFormElement>>(
      event => {
        onBlur?.(event);

        setValidation(
          validate(onValidate)
        );
      },
      [ onBlur, onValidate, setValidation, validate ]
    );

    /**
     * Validate the form on input
     */
    const handleInput = useCallback<FormEventHandler<HTMLFormElement>>(
      event => {
        onInput?.(event);

        setValidation(
          validate(onValidate)
        );
      },
      [ onInput, onValidate, setValidation, validate ]
    );

    // Custom event listener to enable external field validation
    useEffect(() => {
      const listener = () => {
        setValidation(
          validate(onValidate)
        );
      };

      formRef.current?.addEventListener("ZodForm.externalFieldValidate", listener);

      return () => {
        formRef.current?.removeEventListener("ZodForm.externalFieldValidate", listener);

        delete forms?.current[ formId ];
      };
    }, [ formRef.current ]);

    // Watch fetcher data to trigger response handler
    useEffect(() => {
      if (form?.data && form?.state === "idle") {
        onResponse?.(form?.data || data);
      }
    }, [ form?.data, form?.state, onResponse ]);

    return (
      <FetcherForm
        id={ formId }
        method="post"
        navigate={ false }
        onBlur={ handleBlur }
        onInput={ handleInput }
        { ...rest }
        ref={ formRef }>
        <input
          name="_intent"
          type="hidden"
          value={ String(intent) } />
        { children }
      </FetcherForm>
    );
  }

  /**
   * ZodFormField component
   */
  function Field<
    FieldPath extends Paths<z.infer<IntentSchemaType>, { bracketNotation: true; }>,
  > (
    props: ZodFormFieldProps<IntentSchemaType, FieldPath>
  ) {
    let {
      children,
      onBlur,
      onInput,
      type = "text",
      ...rest
    } = props;

    // Get form context
    const { forms } = (
      useContext(ZodFormContext)
    );

    // Populate the `form` prop with contextual ID
    rest.form ||= formId;

    // Get the current form
    const form = rest.form && forms?.current?.[ rest.form ];

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
        form?.data?.validation?.data || actionData?.validation?.data
      );

      // If the default value exists
      if (defaultValue !== undefined) {
        // Populate it on the field
        rest.defaultValue = defaultValue;
      }

      // Get the shape of the field schema
      const shape = path.toSchema(intentSchema);

      // If we found the shape for this field
      if (shape) {
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

        // If the field should be required
        if (!shape.isOptional() && !shape.isNullable() && !("required" in rest)) {
          // Set the required attribute
          Object.assign(rest, {
            required: true,
          });
        }

        // Look through the field's checks
        for (const check of shape.def.checks || []) {
          // If the field has a regex pattern
          if ("format" in check._zod.def && check._zod.def.format === "regex" && "pattern" in check._zod.def && !("pattern" in rest)) {
            // Set the pattern attribute
            Object.assign(rest, {
              pattern: check._zod.def.pattern,
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

        if (form?.form) {
          // If the form exists, trigger a synthetic validation event
          const event = new CustomEvent("ZodForm.externalFieldValidate");

          form.form.current?.dispatchEvent(event);
        }
      },
      [ onBlur ]
    );

    /**
     * Validate the form on input
     */
    const handleInput = useCallback<FormEventHandler<HTMLInputElement>>(
      event => {
        onInput?.(event as any);

        if (form?.form) {
          // If the form exists, trigger a synthetic validation event
          const event = new CustomEvent("ZodForm.externalFieldValidate");

          form.form.current?.dispatchEvent(event);
        }
      },
      [ onInput ]
    );

    return (
      children
        ? typeof children === "function"
          ? (
            <>
              { children(rest as any) }
            </>
          )
          : (
            <select
              multiple
              onBlur={ handleBlur }
              onInput={ handleInput }
              { ...rest as any }>
              { children }
            </select>
          )
        : type === "textarea"
          ? (
            <textarea
              onBlur={ handleBlur }
              onInput={ handleInput }
              { ...rest as any } />
          )
          : (
            <input
              onBlur={ handleBlur }
              onInput={ handleInput }
              type={ type }
              { ...rest as any } />
          )
    );
  }

  // Create form context
  const form: ZodFormContextType<IntentSchemaType> = {
    data: data || actionData,
    id: formId,
    intent: String(intent),
    load,
    schema: intentSchema,
    state,
    submit,
    validate,
    Field,
    Form,
  };

  // Add this form to the list
  forms.current[ formId ] = form;

  return form;
}