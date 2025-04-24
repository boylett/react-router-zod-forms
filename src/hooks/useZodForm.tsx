import React, { useCallback, useContext, useId, useState } from "react";
import { useActionData, useFetcher } from "react-router";
import type { Paths } from "type-fest";
import { z } from "zod";
import { Field, type ZodFormFieldProps } from "../components/Field";
import { Form, type ZodFormProps } from "../components/Form";
import { Message, type ZodFormMessageProps } from "../components/Message";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext, type ZodFormsContextType } from "../context/FormsContext";
import { formDataToObject } from "../utils/formDataToObject";
import type { HandleZodFormMessage } from "./handleZodForm";

/**
 * Options for the useZodForms hook
 */
export interface useZodFormOptions<
  SchemaType extends z.ZodInterface<any>,
  Intent extends keyof z.infer<SchemaType[ "def" ][ "shape" ]>,
> {
  /**
   * Configure which events trigger validation
   * 
   * @remarks
   * Defaults to `[ "beforeSubmit", "change" ]`
   */
  events?: ("beforeSubmit" | "blur" | "change" | "input")[];

  /**
   * The current form intent
   */
  intent: Intent;

  /**
   * The Zod schema used to validate form data
   */
  schema: SchemaType;
}

export type useZodFormsReturnType<
  DataType = any,
  SchemaType extends z.ZodInterface<any> = z.ZodInterface<any>,
  FieldPath extends Paths<z.infer<SchemaType>, { bracketNotation: true; }> = Paths<z.infer<SchemaType>, { bracketNotation: true; }>
> = Pick<
  ZodFormsContextType<
    DataType,
    SchemaType,
    FieldPath
  >,
  | "data"
  | "id"
  | "intent"
  | "load"
  | "schema"
  | "state"
  | "submit"
  | "validate"
  | "validation"
  | "Field"
  | "Form"
  | "Message"
>;

/**
 * Initialize a new Form instance
 */
export function useZodForm<
  SchemaType extends z.ZodInterface<any>,
  Intent extends keyof z.infer<SchemaType>,
  PayloadType = any,
  IntentSchemaType extends z.ZodInterface<any> = SchemaType[ "def" ][ "shape" ][ Intent ]
> (
  options: useZodFormOptions<SchemaType, Intent>
): useZodFormsReturnType<
  HandleZodFormMessage<
    IntentSchemaType,
    PayloadType
  >,
  IntentSchemaType
> {
  const {
    events = [ "beforeSubmit", "change" ],
    intent,
    schema,
  } = options;

  // Get the zod form context
  const { forms } = useContext(ZodFormsContext);

  // If there is no context
  if (forms === undefined) {
    throw new Error("`ZodFormsContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
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

  // Create a React Router fetcher for this form
  const {
    // Use action data if fetcher data is not available
    data = (
      actionData?.intent === intent
        ? actionData
        : undefined
    ),
    load,
    state,
    submit,
    Form: FetcherForm,
  } = (
      useFetcher()
    );

  // Current validation state
  const [ validation, setValidation ] = (
    useState<z.ZodSafeParseResult<z.infer<IntentSchemaType>> | undefined>(undefined)
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

        setValidation(validation);

        return validation;
      }
    },
    [ formId, intentSchema ]
  );

  // Create the field component
  const FieldComponent = useCallback(
    (props: ZodFormFieldProps<IntentSchemaType, Paths<z.infer<IntentSchemaType>, { bracketNotation: true; }>>) => (
      <ZodFormContext value={ formId }>
        <Field { ...props } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // Create the form component
  const FormComponent = useCallback(
    (props: ZodFormProps<IntentSchemaType>) => (
      <ZodFormContext value={ formId }>
        <Form { ...props } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // Create the message component
  const MessageComponent = useCallback(
    (props: ZodFormMessageProps<PayloadType, IntentSchemaType, Paths<z.infer<IntentSchemaType>, { bracketNotation: true; }>>) => (
      <ZodFormContext value={ formId }>
        <Message { ...props } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // Create the form object
  const form: ZodFormsContextType<
    HandleZodFormMessage<IntentSchemaType>,
    IntentSchemaType
  > = {
    data: data || actionData,
    id: formId,
    intent: String(intent),
    load,
    schema: intentSchema,
    state,
    submit,
    validate,
    validation,
    FetcherForm,
    Field: FieldComponent,
    Form: FormComponent,
    Message: MessageComponent,
  };

  // Add this form to the list
  forms.current[ formId ] = form;

  return {
    data: form.data,
    id: form.id,
    intent: form.intent,
    load: form.load,
    schema: form.schema,
    state: form.state,
    submit: form.submit,
    validate: form.validate,
    validation: form.validation,
    Field: form.Field,
    Form: form.Form,
    Message: form.Message,
  };
}