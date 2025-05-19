import React, { useCallback, useContext, useId, useState } from "react";
import { useActionData, useFetcher, useNavigation } from "react-router";
import type { Paths } from "type-fest";
import { z } from "zod/v4";
import { Field, type ZodFormFieldProps } from "../components/Field";
import { Form, type ZodFormProps } from "../components/Form";
import { Message, type ZodFormMessageProps } from "../components/Message";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext, type ZodFormsContextType, type ZodFormsContextTypeFetcher, type ZodFormsContextTypeForm } from "../context/FormsContext";
import { formDataToObject } from "../utils/formDataToObject";
import type { HandleZodFormMessage } from "./handleZodForm";

/**
 * Options for the useZodForms hook
 */
interface useZodFormOptionsFetcher<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType[ "_zod" ][ "def" ][ "shape" ]>,
> {
  /**
   * Configure which events trigger validation
   * 
   * @remarks
   * Defaults to `[ "blur", "form.submit" ]`
   */
  events?: ZodFormsContextType[ "events" ];

  /**
   * The current form intent
   */
  intent: Intent;

  /**
   * The Zod schema used to validate form data
   */
  schema: SchemaType;

  /**
   * Whether to use a fetcher for this form
   * 
   * @remarks
   * Defaults to `false`.
   */
  useFetcher: true;
}

/**
 * Options for the useZodForms hook
 */
interface useZodFormOptionsForm<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType[ "_zod" ][ "def" ][ "shape" ]>,
> {
  /**
   * Configure which events trigger validation
   * 
   * @remarks
   * Defaults to `[ "blur", "form.submit" ]`
   */
  events?: ZodFormsContextType[ "events" ];

  /**
   * The current form intent
   */
  intent: Intent;

  /**
   * The Zod schema used to validate form data
   */
  schema: SchemaType;

  /**
   * Whether to use a fetcher for this form
   * 
   * @remarks
   * Defaults to `false`.
   */
  useFetcher?: false;
}

/**
 * Options for the useZodForms hook
 */
export type useZodFormOptions<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType[ "_zod" ][ "def" ][ "shape" ]>,
> =
  | useZodFormOptionsFetcher<SchemaType, Intent>
  | useZodFormOptionsForm<SchemaType, Intent>;

/**
 * Return type of the useZodForm hook
 */
type useZodFormsReturnTypeFetcher<
  DataType = any,
  SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
  FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
> = Pick<
  ZodFormsContextTypeFetcher<
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
 * Return type of the useZodForm hook
 */
type useZodFormsReturnTypeForm<
  DataType = any,
  SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
  FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
> = Pick<
  ZodFormsContextTypeForm<
    DataType,
    SchemaType,
    FieldPath
  >,
  | "data"
  | "id"
  | "intent"
  | "schema"
  | "state"
  | "validate"
  | "validation"
  | "Field"
  | "Form"
  | "Message"
>;

/**
 * Return type of the useZodForm hook
 */
export type useZodFormsReturnType<
  DataType = any,
  SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
  FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
> =
  | useZodFormsReturnTypeFetcher<DataType, SchemaType, FieldPath>
  | useZodFormsReturnTypeForm<DataType, SchemaType, FieldPath>;

/**
 * Initialize a new Form instance
 */
export function useZodForm<
  SchemaType extends z.ZodObject<any>,
  Intent extends keyof z.output<SchemaType>,
  PayloadType = any,
  IntentSchemaType extends z.ZodObject<any> = SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ]
> (
  options: useZodFormOptionsFetcher<SchemaType, Intent>
): useZodFormsReturnTypeFetcher<
  HandleZodFormMessage<
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
  options: useZodFormOptionsForm<SchemaType, Intent>
): useZodFormsReturnTypeForm<
  HandleZodFormMessage<
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
  options: useZodFormOptions<SchemaType, Intent>
): useZodFormsReturnType<
  HandleZodFormMessage<
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
    (props: ZodFormFieldProps<IntentSchemaType, Paths<z.output<IntentSchemaType>, { bracketNotation: true; }>>) => (
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
    (props: ZodFormMessageProps<PayloadType, IntentSchemaType, Paths<z.output<IntentSchemaType>, { bracketNotation: true; }>>) => (
      <ZodFormContext value={ formId }>
        <Message { ...props } />
      </ZodFormContext>
    ),
    [ formId ]
  );

  // If fetcher is enabled
  if (fetcher) {
    // Create the form object
    const form: ZodFormsContextTypeFetcher<
      HandleZodFormMessage<IntentSchemaType>,
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

  // Create the form object
  const form: ZodFormsContextTypeForm<
    HandleZodFormMessage<IntentSchemaType>,
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
  forms.current[ formId ] = form;

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