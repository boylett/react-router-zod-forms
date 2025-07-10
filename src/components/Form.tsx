import { useCallback, useContext, useEffect, useRef, type FocusEventHandler, type FormEventHandler } from "react";
import { Form as ReactRouterForm } from "react-router";
import { z } from "zod";
import { ZodFormContext } from "../context/FormContext.js";
import { ZodFormsContext } from "../context/FormsContext.js";
import type { ZodForms } from "../types.js";

/**
 * Form component
 */
export function Form<
  SchemaType extends z.ZodObject<any>
> (
  props: ZodForms.Components.Form.Props<SchemaType>
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

  // Keep a local copy of the form context in case the form is detached from the DOM
  const localContext = useRef<Partial<ZodForms.Context> | null>(null);

  // Get form context
  const { forms } = (
    useContext(ZodFormsContext)
  );

  // If there is no context
  if (forms === undefined) {
    throw new Error("`ZodFormsContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
  }

  // Get current form context
  formId ||= useContext(ZodFormContext);

  // If a form ID was not defined
  if (!formId) {
    throw new Error("Form identifier not supplied. Pass `id` prop or use `useZodForm` hook to generate this component.");
  }

  // Get the current form
  const form = formId && forms?.current?.[ formId ] || localContext.current || undefined;

  // If a form was not found
  if (!form) {
    throw new Error("Could not connect to form context. Check `id` prop or wrap component with a Zod Forms `<Form />` component.");
  }

  // Create a new form element reference
  ref ||= useRef<HTMLFormElement>(null);

  // Assign the reference and validation result to context
  if (form && forms.current[ formId ]) {
    forms.current[ formId ]!.form = ref;
  }

  // Save local context
  localContext.current ||= forms.current[ formId ] || null;

  const {
    events,
    FormElement = ReactRouterForm,
    intent,
    validate,
    validation,
  } = forms.current[ formId ] as Partial<ZodForms.Context>;

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
        validate?.(onValidate as any);
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
        validate?.(onValidate as any);
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
        submitValidation = validate?.(onValidate as any);
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
    const listener = () => validate?.(onValidate as any);

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
      encType="multipart/form-data"
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
