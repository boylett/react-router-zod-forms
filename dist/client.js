import { DateTime } from "luxon";
import React, { useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useActionData, useFetcher } from "react-router";
import { ZodFormContext } from "./context";
import { formDataToObject } from "./utils/formDataToObject";
import { Path } from "./utils/path";
/**
 * Initialize a new ZodForm instance
 */
export function useZodForm(options) {
    const { intent, schema, } = options;
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
    const intentSchema = schema.def.shape[intent];
    // Create a unique ID for this form
    const formId = useId();
    // Get action data
    const actionData = (useActionData());
    // Create the React Router fetcher for this form
    const { data, Form: FetcherForm, load, state, submit } = (useFetcher());
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
            return validation;
        }
    }, [intentSchema]);
    /**
     * ZodForm component
     */
    function Form(props) {
        const { children, onBlur, onInput, onResponse, onValidate, ...rest } = props;
        // Get form context
        const { forms } = (useContext(ZodFormContext));
        // If there is no context
        if (forms === undefined) {
            throw new Error("`ZodFormContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
        }
        // Create a new form reference
        const formRef = useRef(null);
        // Get the current form
        const form = formId && forms?.current?.[formId] || undefined;
        // Assign the reference to context
        if (form) {
            forms.current[formId].form = formRef;
        }
        // Current validation state
        const [validation, setValidation] = useState(undefined);
        /**
         * Validate the form on blur
         */
        const handleBlur = useCallback(event => {
            onBlur?.(event);
            setValidation(validate(onValidate));
        }, [onBlur, onValidate, setValidation, validate]);
        /**
         * Validate the form on input
         */
        const handleInput = useCallback(event => {
            onInput?.(event);
            setValidation(validate(onValidate));
        }, [onInput, onValidate, setValidation, validate]);
        // Custom event listener to enable external field validation
        useEffect(() => {
            const listener = () => {
                setValidation(validate(onValidate));
            };
            formRef.current?.addEventListener("ZodForm.externalFieldValidate", listener);
            return () => {
                formRef.current?.removeEventListener("ZodForm.externalFieldValidate", listener);
                delete forms?.current[formId];
            };
        }, [formRef.current]);
        // Watch fetcher data to trigger response handler
        useEffect(() => {
            if (form?.data && form?.state === "idle") {
                onResponse?.(form?.data || data);
            }
        }, [form?.data, form?.state, onResponse]);
        return (React.createElement(FetcherForm, { id: formId, method: "post", navigate: false, onBlur: handleBlur, onInput: handleInput, ...rest, ref: formRef },
            React.createElement("input", { name: "_intent", type: "hidden", value: String(intent) }),
            children));
    }
    /**
     * ZodFormField component
     */
    function Field(props) {
        let { children, onBlur, onInput, type = "text", ...rest } = props;
        // Get form context
        const { forms } = (useContext(ZodFormContext));
        // Populate the `form` prop with contextual ID
        rest.form ||= formId;
        // Get the current form
        const form = rest.form && forms?.current?.[rest.form];
        // If the field is not hidden, make it focusable with keyboard shortcuts
        if (type !== "hidden" && !("tabIndex" in rest)) {
            rest.tabIndex ||= 0;
        }
        // If the input has a name
        if (rest.name) {
            // Create a new path
            const path = new Path(rest.name);
            // Get the default value from the current action data
            const defaultValue = path.pickFrom((form?.data?.validation?.data?.intent === intent
                ? form.data.validation.data
                : undefined) || (actionData?.validation?.data?.intent === intent
                ? actionData.validation.data
                : undefined));
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
                            .fromJSDate(new Date(shape.maxDate))
                            .toFormat(type === "datetime-local"
                            ? "yyyy-MM-dd'T'HH:mm"
                            : type === "time"
                                ? "HH:mm"
                                : type === "week"
                                    ? "yyyy-'W'W"
                                    : type === "month"
                                        ? "yyyy-MM"
                                        : "yyyy-MM-dd"),
                    });
                }
                // If the field has a min date
                if ("minDate" in shape && !("min" in rest)) {
                    // Set the min date of the field
                    Object.assign(rest, {
                        min: DateTime
                            .fromJSDate(new Date(shape.minDate))
                            .toFormat(type === "datetime-local"
                            ? "yyyy-MM-dd'T'HH:mm"
                            : type === "time"
                                ? "HH:mm"
                                : type === "week"
                                    ? "yyyy-'W'W"
                                    : type === "month"
                                        ? "yyyy-MM"
                                        : "yyyy-MM-dd"),
                    });
                }
                // If the field has a max length
                if ("maxLength" in shape && !("max" in rest)) {
                    // Set the max length of the field
                    Object.assign(rest, {
                        [shape.def.type === "string"
                            ? "maxLength"
                            : "max"]: shape.maxLength,
                    });
                }
                // If the field has a min length
                if ("minLength" in shape && !("min" in rest)) {
                    // Set the min length of the field
                    Object.assign(rest, {
                        [shape.def.type === "string"
                            ? "minLength"
                            : "min"]: shape.minLength,
                    });
                }
                if ((
                // If the field is an integer
                (shape.def.type === "number" && "format" in shape.def && shape.def.format === "safeint") ||
                    // If the field is a datetime
                    type === "date") && !("step" in rest)) {
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
                            pattern: String(check._zod.def.pattern).substring(1).replace(/\/([a-z]+)?$/i, ""),
                        });
                    }
                }
            }
        }
        /**
         * Validate the form on blur
         */
        const handleBlur = useCallback(event => {
            onBlur?.(event);
            if (form?.form) {
                // If the form exists, trigger a synthetic validation event
                const event = new CustomEvent("ZodForm.externalFieldValidate");
                form.form.current?.dispatchEvent(event);
            }
        }, [onBlur]);
        /**
         * Validate the form on input
         */
        const handleInput = useCallback(event => {
            onInput?.(event);
            if (form?.form) {
                // If the form exists, trigger a synthetic validation event
                const event = new CustomEvent("ZodForm.externalFieldValidate");
                form.form.current?.dispatchEvent(event);
            }
        }, [onInput]);
        return (children
            ? typeof children === "function"
                ? (React.createElement(React.Fragment, null, children(rest)))
                : (React.createElement("select", { multiple: true, onBlur: handleBlur, onInput: handleInput, ...rest }, children))
            : type === "textarea"
                ? (React.createElement("textarea", { onBlur: handleBlur, onInput: handleInput, ...rest }))
                : (React.createElement("input", { onBlur: handleBlur, onInput: handleInput, type: type, ...rest })));
    }
    // Create form context
    const form = {
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
    forms.current[formId] = form;
    return form;
}
