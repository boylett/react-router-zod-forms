import { useCallback, useContext, useId, useState } from "react";
import { useActionData, useFetcher, useNavigation } from "react-router";
import type { Paths } from "type-fest/source/paths.js";
import { z } from "zod/v4";
import { Field } from "../components/Field.js";
import { Form } from "../components/Form.js";
import { Message } from "../components/Message.js";
import { ZodFormContext } from "../context/FormContext.js";
import { ZodFormsContext } from "../context/FormsContext.js";
import type { ZodForms } from "../types.js";
import { formDataToObject } from "../utils/formDataToObject.js";

/**
 * Initialize a new Form instance
 */
export function useZodForm<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType>,
  PayloadType = any,
  IntentSchemaType extends z.ZodObject<any> = SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ]
> (
  options: ZodForms.UseZodForm.Options.Fetcher<SchemaType, Intent>
): ZodForms.UseZodForm.Fetcher<
  ZodForms.Response<
    IntentSchemaType,
    PayloadType
  >,
  IntentSchemaType
>;

/**
 * Initialize a new Form instance
 */
export function useZodForm<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType>,
  PayloadType = any,
  IntentSchemaType extends z.ZodObject<any> = SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ]
> (
  options: ZodForms.UseZodForm.Options.Form<SchemaType, Intent>
): ZodForms.UseZodForm.Form<
  ZodForms.Response<
    IntentSchemaType,
    PayloadType
  >,
  IntentSchemaType
>;

/**
 * Initialize a new Form instance
 */
export function useZodForm<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType>,
  PayloadType = any,
  IntentSchemaType extends z.ZodObject<any> = SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ]
> (
  options: ZodForms.UseZodForm.Options<SchemaType, Intent>
): ZodForms.UseZodForm<
  ZodForms.Response<
    IntentSchemaType,
    PayloadType
  >,
  IntentSchemaType
> {
  const {
    events = [ "blur", "form.submit" ],
    intent,
    schema,
    useFetcher: fetcher = false,
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

  // Get global navigation state
  const { state: navState } = (
    useNavigation()
  );

  // Create a React Router fetcher for this form
  const {
    // Use action data if fetcher data is not available
    data = (
      actionData?.intent === intent
        ? actionData
        : undefined
    ),
    // Use navigation state if fetcher is not enabled
    state = navState,
    Form: FormElement,
    load,
    submit,
  } = (
      fetcher
        ? useFetcher()
        : {}
    );

  // Current validation state
  const [ validation, setValidation ] = (
    useState<z.ZodSafeParseResult<z.output<IntentSchemaType>> | undefined>(undefined)
  );

  /**
   * Validate the form data against the schema
   */
  const validate = useCallback(
    (callback?: (data: z.output<IntentSchemaType>, validation: z.ZodSafeParseResult<z.output<IntentSchemaType>>) => void) => {
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
    (props: ZodForms.Components.Field.Props<IntentSchemaType, Paths<z.output<IntentSchemaType>, { bracketNotation: true; }>>) => (
      <ZodFormContext value={ formId }>
        <Field { ...props } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // Create the form component
  const FormComponent = useCallback(
    (props: ZodForms.Components.Form.Props<IntentSchemaType>) => (
      <ZodFormContext value={ formId }>
        <Form { ...props } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // Create the message component
  const MessageComponent = useCallback(
    (props: ZodForms.Components.Message.Props<PayloadType, IntentSchemaType, Paths<z.output<IntentSchemaType>, { bracketNotation: true; }>>) => (
      <ZodFormContext value={ formId }>
        <Message { ...props as any } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // If fetcher is enabled
  if (fetcher) {
    // Create the form object
    const form: ZodForms.Context.Fetcher<
      ZodForms.Response<IntentSchemaType>,
      IntentSchemaType
    > = {
      data: data || actionData,
      events,
      id: formId,
      intent: String(intent),
      load: load!,
      schema: intentSchema,
      state,
      submit: submit!,
      validate,
      validation,
      Field: FieldComponent,
      FormElement,
      Form: FormComponent,
      Message: MessageComponent,
    };

    // Add this form to the list
    forms.current[ formId ] = form as any;

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

  // Create the form object
  const form: ZodForms.Context.Form<
    ZodForms.Response<IntentSchemaType>,
    IntentSchemaType
  > = {
    data: data || actionData,
    events,
    id: formId,
    intent: String(intent),
    schema: intentSchema,
    state,
    validate,
    validation,
    Field: FieldComponent,
    FormElement,
    Form: FormComponent,
    Message: MessageComponent,
  };

  // Add this form to the list
  forms.current[ formId ] = form as any;

  return {
    data: form.data,
    id: form.id,
    intent: form.intent,
    schema: form.schema,
    state: form.state,
    validate: form.validate,
    validation: form.validation,
    Field: form.Field,
    Form: form.Form,
    Message: form.Message,
  };
}