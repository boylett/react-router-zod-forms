import { parseFormData } from "@mjackson/form-data-parser";
import z from "zod";
import { formDataToObject } from "./utils/formDataToObject";
/**
 * Handle Zod Form submission
 */
export async function handleZodForm(props, forms, hooks) {
    const { parserOptions, request, schema, transform, uploadHandler, } = props;
    const formData = (parserOptions
        ? await parseFormData(request, parserOptions, uploadHandler)
        : await parseFormData(request, uploadHandler));
    hooks?.before?.(formData);
    const intent = (formData.get("_intent") ?? "default");
    let data = (formDataToObject(formData, transform));
    let validation = {
        data,
        error: new z.ZodError([]),
        success: false,
    };
    if (intent !== "default" && intent in schema.def.shape && intent in forms && forms[intent]) {
        const hookData = (hooks?.beforeValidate?.(data));
        if (hookData) {
            data = hookData;
        }
        validation = (await schema.def.shape[intent].safeParseAsync(data));
        const hookResult = (hooks?.afterValidate?.(validation));
        if (hookResult) {
            validation = hookResult;
        }
        if (validation) {
            validation.data ||= data;
        }
        const response = {
            intent,
            message: "ok",
            payload: null,
            status: 200,
            validation,
        };
        const payload = {
            data,
            response,
            validation,
        };
        try {
            const action = (await forms[intent](payload) || undefined);
            if (!action) {
                return response;
            }
            return action;
        }
        catch (e) {
            return {
                ...response,
                message: "error",
                payload: e,
                status: 500,
            };
        }
        finally {
            hooks?.after?.(formData);
        }
    }
    if ("default" in forms && forms.default) {
        const response = {
            intent,
            message: "ok",
            payload: null,
            status: 200,
            validation,
        };
        const payload = {
            data,
            response,
            validation,
        };
        try {
            const action = (await forms.default(payload) || undefined);
            if (!action) {
                return response;
            }
            return action;
        }
        catch (e) {
            return {
                ...response,
                message: "error",
                payload: e,
                status: 500,
            };
        }
        finally {
            hooks?.after?.(formData);
        }
    }
    console.trace();
    console.error(`Unhandled form submission for intent '${intent}' in ${request.url}`);
    hooks?.after?.(formData);
    return {
        intent,
        message: "Not Implemented",
        payload: null,
        status: 501,
        validation: undefined,
    };
}
