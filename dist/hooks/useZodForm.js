import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useContext, useId, useState } from "react";
import { useActionData, useFetcher, useNavigation } from "react-router";
import { z } from "zod";
import { Field } from "../components/Field.js";
import { Form } from "../components/Form.js";
import { Message } from "../components/Message.js";
import { ZodFormContext } from "../context/FormContext.js";
import { ZodFormsContext } from "../context/FormsContext.js";
import { formDataToObject } from "../utils/formDataToObject.js";
/**
 * Initialize a new Form instance
 */
export function useZodForm(options) {
    const { events = ["blur", "form.submit"], intent, schema, useFetcher: fetcher = false, } = options;
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
    // Get global navigation state
    const { state: navState } = (useNavigation());
    // Create a React Router fetcher for this form
    const { 
    // Use action data if fetcher data is not available
    data = (actionData?.intent === intent
        ? actionData
        : undefined), 
    // Use navigation state if fetcher is not enabled
    state = navState, Form: FormElement, load, submit, } = (fetcher
        ? useFetcher()
        : {});
    // Current validation state
    const [validation, setValidation] = (useState(data?.validation && typeof data.validation === "object" && "data" in data.validation && "error" in data.validation && "success" in data.validation
        ? data.validation
        : undefined));
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
    const FieldComponent = useCallback((props) => (_jsx(ZodFormContext, { value: formId, children: _jsx(Field, { form: formId, ...props }) })), [formId]);
    // Create the form component
    const FormComponent = useCallback((props) => (_jsx(ZodFormContext, { value: formId, children: _jsx(Form, { ...props }) })), [formId]);
    // Create the message component
    const MessageComponent = useCallback((props) => (_jsx(ZodFormContext, { value: formId, children: _jsx(Message, { form: formId, ...props }) })), [formId]);
    // If fetcher is enabled
    if (fetcher) {
        // Create the form object
        const form = {
            data,
            events,
            id: formId,
            intent: String(intent),
            load: load,
            schema: intentSchema,
            state,
            submit: submit,
            validate,
            validation,
            Field: FieldComponent,
            FormElement,
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
    // Create the form object
    const form = {
        data,
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
    forms.current[formId] = form;
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
//# sourceMappingURL=useZodForm.js.map