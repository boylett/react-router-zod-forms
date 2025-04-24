import React, { useContext } from "react";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
export function Message(props) {
    let { as: Element = "div", children, form: formId, name, ...rest } = props;
    // Get forms context
    const { forms } = (useContext(ZodFormsContext));
    // If there is no context
    if (forms === undefined) {
        throw new Error("`ZodFormsContext` is not defined. Make sure to wrap your `<App />` with `<ZodFormProvider />`.");
    }
    // Get current form context
    formId ||= (useContext(ZodFormContext));
    // If a form was not defined
    if (!formId) {
        throw new Error("Form identifier not supplied. Pass `form` prop or wrap component with a Zod Forms `<Form />` component.");
    }
    // Get the current form
    const form = formId && forms?.current?.[formId];
    // If a form was not found
    if (!form) {
        throw new Error("Could not connect to form context. Check `form` prop or wrap component with a Zod Forms `<Form />` component.");
    }
    return (children
        ? (React.createElement(React.Fragment, null, children({ ...rest })))
        : (React.createElement(Element, { ...rest },
            React.createElement("p", null, JSON.stringify({})))));
}
