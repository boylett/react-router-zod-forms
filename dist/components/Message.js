import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { z } from "zod/v4";
import { ZodFormContext } from "../context/FormContext.js";
import { ZodFormsContext } from "../context/FormsContext.js";
import { Path } from "../utils/Path.js";
/**
 * Message component
 */
export function Message(props) {
    let { as: Element = "div", children, className, form: formId, name, ...rest } = props;
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
    // The schema for this field
    let shape = undefined;
    // If a field name is set
    if (name && schema) {
        // Create a new path
        const path = new Path(name);
        // Get the field schema
        shape = path.toSchema(schema);
    }
    // If a field name is not set
    if (!name) {
        // If there is not a message
        if (!data?.message && !data?.status) {
            return undefined;
        }
        return (children
            ? children({
                ...rest,
                className: `react-router-zod-forms__form-message ${className || ""}`.trim(),
            }, schema, data)
            : (_jsx(Element, { className: `react-router-zod-forms__form-message ${className || ""}`.trim(), "data-status": data.status, title: data.status >= 400 && data.payload && data.payload instanceof Error
                    ? data.payload.message
                    : data.message, ...rest, children: _jsx("p", { children: data.status >= 400 && data.payload && data.payload instanceof Error
                        ? data.payload.message
                        : data.message }) })));
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
            .filter((issue) => fieldPath.is(issue.path) ||
            (wildcard && fieldPath.startsWith(issue.path)));
    // If there are no issues for this field
    if (issues.length === 0) {
        return undefined;
    }
    return (children
        ? children({
            ...rest,
            className: `react-router-zod-forms__form-message ${className || ""}`.trim(),
        }, shape, issues)
        : (_jsx(Element, { className: `react-router-zod-forms__field-message ${className || ""}`.trim(), ...rest, children: _jsx("ul", { children: issues
                    .filter(Boolean)
                    .map((issue) => {
                    // Get the field path
                    const fieldPath = new Path(issue.path);
                    // Get the field schema
                    const fieldSchema = schema && fieldPath.toSchema(schema);
                    return (_jsxs("li", { "data-issue-code": issue.code, children: [_jsx("strong", { children: fieldSchema?.meta()?.description || fieldPath.toPrettyString() }), _jsx("span", { children: issue.message })] }, `${issue.path}${issue.code}`));
                }) }) })));
}
//# sourceMappingURL=Message.js.map