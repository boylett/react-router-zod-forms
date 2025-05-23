import React, { useCallback, useContext, useEffect, useRef, type FocusEventHandler, type FormEventHandler, type RefObject } from "react";
import { Form as ReactRouterForm, type FormProps } from "react-router";
import { z } from "zod/v4";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";

/**
 * Props for the Form component
 */
export interface ZodFormProps<
  SchemaType extends z.ZodObject<any>
> extends FormProps {
  /**
   * Whether to embed the current intent as a hidden field
   * 
   * @remarks
   * Defaults to `true`
   */
  intent?: boolean;

  /**
   * Called when data returns from the action
   */
  onResponse?: (data: any) => void;

  /**
   * Called during form data validation
   */
  onValidate?: (data: z.output<SchemaType>, validation: z.ZodSafeParseResult<z.output<SchemaType>>) => void;

  /**
   * Form element reference
   */
  ref?: RefObject<HTMLFormElement | null>;
}

/**
 * Form component
 */
export function Form<
  SchemaType extends z.ZodObject<any>
> (
  props: ZodFormProps<SchemaType>
) {
  let {
    children,
    className,
    id: formId,
    intent: embedIntent = true,
    onBlur,
    onInput,
    onResponse,
    onSubmit,
    onValidate,
    ref,
    ...rest
  } = props;

  // Get form context
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

  // If a form ID was not defined
  if (!formId) {
    throw new Error("Form identifier not supplied. Pass `id` prop or use `useZodForm` hook to generate this component.");
  }

  // Get the current form
  const form = formId && forms?.current?.[ formId ] || undefined;

  // If a form was not found
  if (!form) {
    throw new Error("Could not connect to form context. Check `id` prop or wrap component with a Zod Forms `<Form />` component.");
  }

  // Create a new form element reference
  ref ||= useRef<HTMLFormElement>(null);

  // Assign the reference and validation result to context
  if (form) {
    forms.current[ formId ].form = ref;
  }

  const {
    events,
    FormElement = ReactRouterForm,
    intent,
    validate,
    validation,
  } = forms.current[ formId ];

  /**
   * Validate the form on blur
   */
  const handleBlur = useCallback<FocusEventHandler<HTMLFormElement>>(
    event => {
      onBlur?.(event);

      // If the event has been cancelled, do not validate
      if (event.defaultPrevented) {
        return;
      }

      if (events?.includes("form.blur")) {
        validate?.(onValidate);
      }
    },
    [ onBlur, onValidate, validate ]
  );

  /**
   * Validate the form on input
   */
  const handleInput = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      onInput?.(event);

      // If the event has been cancelled, do not validate
      if (event.defaultPrevented) {
        return;
      }

      // Validate the form
      if (events?.includes("form.input")) {
        validate?.(onValidate);
      }
    },
    [ onInput, onValidate, validate ]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      let submitValidation = validation;

      // Validate the form
      if (events?.includes("form.submit")) {
        submitValidation = validate?.(onValidate);
      }

      // If validation succeeded
      if (submitValidation?.success) {
        onSubmit?.(event);
      }

      // If validation failed
      else {
        // Prevent form submission
        event.preventDefault();
      }
    },
    [ onSubmit, onValidate, validate ]
  );

  // Custom event listener to enable external field validation
  useEffect(() => {
    const listener = () => validate?.(onValidate);

    ref.current?.addEventListener("$ZodForms.externalFieldValidate", listener);

    return () => {
      ref.current?.removeEventListener("$ZodForms.externalFieldValidate", listener);

      delete forms?.current[ formId ];
    };
  }, [ ref.current ]);

  // Watch fetcher data to trigger response handler
  useEffect(() => {
    if (form?.data && form?.state === "idle") {
      onResponse?.(form?.data);
    }
  }, [ form?.data, form?.state, onResponse ]);

  return (
    <FormElement
      className={
        `react-router-zod-forms__form ${ className || "" }`.trim()
      }
      id={ formId }
      method="post"
      onBlur={ handleBlur }
      onInput={ handleInput }
      onSubmit={ handleSubmit }
      { ...rest }
      ref={ ref }>
      { embedIntent && (
        <input
          name="_intent"
          type="hidden"
          value={ String(intent) } />
      ) }
      { children }
    </FormElement>
  );
}
