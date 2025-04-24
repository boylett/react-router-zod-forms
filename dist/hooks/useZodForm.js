import React, { useCallback, useContext, useId, useState } from "react";
import { useActionData, useFetcher } from "react-router";
import { Field } from "../components/Field";
import { Form } from "../components/Form";
import { Message } from "../components/Message";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
import { formDataToObject } from "../utils/formDataToObject";
/**
 * Initialize a new Form instance
 */
export function useZodForm(options) {
    const { events = ["beforeSubmit", "change"], intent, schema, } = options;
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
    const intentSchema = schema.def.shape[intent];
    // Create a unique ID for this form
    const formId = useId();
    // Get action data
    const actionData = (useActionData());
    // Create a React Router fetcher for this form
    const { 
    // Use action data if fetcher data is not available
    data = (actionData?.intent === intent
        ? actionData
        : undefined), load, state, submit, Form: FetcherForm, } = (useFetcher());
    // Current validation state
    const [validation, setValidation] = (useState(undefined));
    /**
     * Validate the form data against the schema
     */
    const validate = useCallback((callback) => {
        // Get the form element by ID
        const form = document.querySelector(`form[id="${formId.replace(/\"/g, "\\\"")}"]`);
        if (form) {
            const data = formDataToObject(form, (key, value) => {
                // Get the input for this key
                const input = (form.querySelector(`[name="${key.replace(/\"/g, "\\\"")}"][type]`) ||
                    document.querySelector(`[form="${formId.replace(/\"/g, "\\\"")}"][name="${key.replace(/\"/g, "\\\"")}"][type]`));
                // Automatically coerce strings to numbers for inputs with number type
                if (input?.type === "number" && String(value).trim().match(/^-?[e\d]+(\.[e\d]+)?$/)) {
                    return parseFloat(String(value));
                }
                return value;
            });
            const validation = intentSchema.safeParse(data);
            callback?.(data, validation);
            setValidation(validation);
            return validation;
        }
    }, [formId, intentSchema]);
    // Create the field component
    const FieldComponent = useCallback((props) => (React.createElement(ZodFormContext, { value: formId },
        React.createElement(Field, { ...props }))), [formId]);
    // Create the form component
    const FormComponent = useCallback((props) => (React.createElement(ZodFormContext, { value: formId },
        React.createElement(Form, { ...props }))), [formId]);
    // Create the message component
    const MessageComponent = useCallback((props) => (React.createElement(ZodFormContext, { value: formId },
        React.createElement(Message, { ...props }))), [formId]);
    // Create the form object
    const form = {
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
    forms.current[formId] = form;
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
