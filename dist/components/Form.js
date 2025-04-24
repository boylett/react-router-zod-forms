import React, { useCallback, useContext, useEffect, useRef } from "react";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
/**
 * Form component
 */
export function Form(props) {
    let { children, id: formId, onBlur, onInput, onResponse, onValidate, ...rest } = props;
    // Get form context
    const { forms } = (useContext(ZodFormsContext));
    // If there is no context
    if (forms === undefined) {
        throw new Error("`ZodFormsContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
    }
    // Get current form context
    formId ||= (useContext(ZodFormContext));
    // If a form ID was not defined
    if (!formId) {
        throw new Error("Form identifier not supplied. Pass `id` prop or use `useZodForm` hook to generate this component.");
    }
    // Get the current form
    const form = formId && forms?.current?.[formId] || undefined;
    // If a form was not found
    if (!form) {
        throw new Error("Could not connect to form context. Check `id` prop or wrap component with a Zod Forms `<Form />` component.");
    }
    // Create a new form element reference
    const formRef = useRef(null);
    // Assign the reference and validation result to context
    if (form) {
        forms.current[formId].form = formRef;
    }
    const { FetcherForm, intent, validate, } = forms.current[formId];
    /**
     * Validate the form on blur
     */
    const handleBlur = useCallback(event => {
        onBlur?.(event);
        validate?.(onValidate);
    }, [onBlur, onValidate, validate]);
    /**
     * Validate the form on input
     */
    const handleInput = useCallback(event => {
        onInput?.(event);
        validate?.(onValidate);
    }, [onInput, onValidate, validate]);
    // Custom event listener to enable external field validation
    useEffect(() => {
        const listener = () => validate?.(onValidate);
        formRef.current?.addEventListener("$ZodForms.externalFieldValidate", listener);
        return () => {
            formRef.current?.removeEventListener("$ZodForms.externalFieldValidate", listener);
            delete forms?.current[formId];
        };
    }, [formRef.current]);
    // Watch fetcher data to trigger response handler
    useEffect(() => {
        if (form?.data && form?.state === "idle") {
            onResponse?.(form?.data);
        }
    }, [form?.data, form?.state, onResponse]);
    return FetcherForm && (React.createElement(FetcherForm, { id: formId, method: "post", navigate: false, onBlur: handleBlur, onInput: handleInput, ...rest, ref: formRef },
        React.createElement("input", { name: "_intent", type: "hidden", value: String(intent) }),
        children));
}
