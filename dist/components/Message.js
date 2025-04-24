import React, { useContext } from "react";
import { ZodFormContext } from "../context/FormContext";
import { ZodFormsContext } from "../context/FormsContext";
import { Path } from "../utils/Path";
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
    // Get validation result from context
    const { data, schema, validation, } = form;
    // If a field name is not set, display the data message
    if (!name) {
        // If there is not a message
        if (!data?.message && !data?.status) {
            return undefined;
        }
        return (children
            ? children({ ...rest, message: data })
            : (React.createElement(Element, { "data-status": data.status, title: data.message, ...rest },
                React.createElement("p", null, data.message))));
    }
    // If validation is not set for this field
    if (!validation || validation.success || validation.error.issues.length === 0) {
        return undefined;
    }
    // Whether this field name is a wildcard
    const wildcard = name.endsWith(".*") || name === "*";
    // Get the field path
    const fieldPath = new Path(name.replace(/\.\*$/, ""));
    // Get the field issues
    const issues = name === "*"
        ? validation.error.issues
        : validation.error.issues
            .filter(issue => fieldPath.is(issue.path) ||
            (wildcard && fieldPath.startsWith(issue.path)));
    // If there are no issues for this field
    if (issues.length === 0) {
        return undefined;
    }
    return (children
        ? children({ ...rest, issues })
        : (React.createElement(Element, { ...rest },
            React.createElement("ul", null, issues
                .filter(Boolean)
                .map(issue => {
                // Get the field path
                const fieldPath = new Path(issue.path);
                // Get the field schema
                const fieldSchema = schema && fieldPath.toSchema(schema);
                return (React.createElement("li", { "data-issue-code": issue.code, key: `${issue.path}${issue.code}` },
                    React.createElement("strong", null, fieldSchema?.meta()?.description || fieldPath.toPrettyString()),
                    React.createElement("span", null, issue.message)));
            })))));
}
