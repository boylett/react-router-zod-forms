import { parseFormData } from "@mjackson/form-data-parser";
import z from "zod";
import { formDataToObject } from "./utils/formDataToObject";
/**
 * Handle Zod Form submission
 */
export async function handleZodForm(props, forms, hooks) {
    const { maxFileSize, maxHeaderSize, request, schema, transform, uploadHandler, } = props;
    const formData = (await parseFormData(request, {
        maxFileSize,
        maxHeaderSize,
    }, async (file) => {
        const hookFile = await hooks?.beforeUpload?.(file);
        if (hookFile) {
            file = hookFile;
        }
        const handle = await uploadHandler?.(file);
        const hookHandle = await hooks?.afterUpload?.(handle);
        if (hookHandle) {
            return hookHandle;
        }
        if (handle) {
            return handle;
        }
    }));
    hooks?.before?.(formData);
    const intent = (formData.get("_intent") ?? "default");
    formData.delete("_intent");
    let data = (formDataToObject(formData, transform));
    let validation = {
        data,
        error: new z.ZodError([]),
        success: false,
    };
    let response = {
        intent,
        message: "ok",
        payload: null,
        status: 200,
        validation,
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
        const payload = {
            data,
            formData,
            intent,
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
            response.message = "error";
            response.payload = e;
            response.status = 500;
            return response;
        }
        finally {
            hooks?.after?.(formData);
        }
    }
    if ("default" in forms && forms.default) {
        const payload = {
            data,
            formData,
            intent,
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
            response.message = "error";
            response.payload = e;
            response.status = 500;
            return response;
        }
        finally {
            hooks?.after?.(formData);
        }
    }
    console.trace();
    console.error(`Unhandled form submission for intent '${intent}' in ${request.url}`);
    hooks?.after?.(formData);
    response.message = "Not Implemented";
    response.payload = null;
    response.status = 501;
    response.validation = {
        data,
        error: new z.ZodError([]),
        success: false,
    };
    return response;
}
