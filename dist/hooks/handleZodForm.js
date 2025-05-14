import { parseFormData } from "@mjackson/form-data-parser";
import z from "zod";
import { formDataToObject } from "../utils/formDataToObject";
/**
 * Handle Zod Form submission
 */
export async function handleZodForm(options, forms, hooks) {
    const { maxFileSize, maxHeaderSize, messages, request, schema, transform, uploadHandler, } = options;
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
    try {
        hooks?.before?.(formData);
    }
    catch (thrown) {
        if (thrown instanceof Response) {
            return thrown;
        }
        else if (thrown &&
            typeof thrown === "object" &&
            ("intent" in thrown &&
                "message" in thrown &&
                "status" in thrown &&
                "validation" in thrown)) {
            return thrown;
        }
        throw thrown;
    }
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
        message: messages?.success || "Success",
        payload: null,
        status: 200,
        validation,
    };
    if (intent !== "default" && intent in schema.def.shape && intent in forms && forms[intent]) {
        try {
            const hookData = (hooks?.beforeValidate?.(data));
            if (hookData) {
                data = hookData;
            }
        }
        catch (thrown) {
            if (thrown instanceof Response) {
                return thrown;
            }
            else if (thrown &&
                typeof thrown === "object" &&
                ("intent" in thrown &&
                    "message" in thrown &&
                    "status" in thrown &&
                    "validation" in thrown)) {
                return thrown;
            }
            throw thrown;
        }
        validation = (await schema.def.shape[intent].safeParseAsync(data));
        try {
            const hookResult = (hooks?.afterValidate?.(validation));
            if (hookResult) {
                validation = hookResult;
            }
        }
        catch (thrown) {
            if (thrown instanceof Response) {
                return thrown;
            }
            else if (thrown &&
                typeof thrown === "object" &&
                ("intent" in thrown &&
                    "message" in thrown &&
                    "status" in thrown &&
                    "validation" in thrown)) {
                return thrown;
            }
            throw thrown;
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
        catch (thrown) {
            if (thrown instanceof Response) {
                return thrown;
            }
            if (thrown instanceof Error) {
                response.message = messages?.error || "Error";
                response.payload = thrown;
                response.status = 500;
                return response;
            }
            throw thrown;
        }
        finally {
            try {
                hooks?.after?.(formData);
            }
            catch (thrown) {
                if (thrown instanceof Response) {
                    return thrown;
                }
                else if (thrown &&
                    typeof thrown === "object" &&
                    ("intent" in thrown &&
                        "message" in thrown &&
                        "status" in thrown &&
                        "validation" in thrown)) {
                    return thrown;
                }
                throw thrown;
            }
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
        catch (thrown) {
            if (thrown instanceof Response) {
                return thrown;
            }
            if (thrown instanceof Error) {
                response.message = messages?.error || "Error";
                response.payload = thrown;
                response.status = 500;
                return response;
            }
            throw thrown;
        }
        finally {
            try {
                hooks?.after?.(formData);
            }
            catch (thrown) {
                if (thrown instanceof Response) {
                    return thrown;
                }
                else if (thrown &&
                    typeof thrown === "object" &&
                    ("intent" in thrown &&
                        "message" in thrown &&
                        "status" in thrown &&
                        "validation" in thrown)) {
                    return thrown;
                }
                throw thrown;
            }
        }
    }
    console.trace();
    console.error(`Unhandled form submission for intent '${intent}' in ${request.url}`);
    response.message = messages?.notImplemented || "Not Implemented";
    response.payload = null;
    response.status = 501;
    response.validation = {
        data,
        error: new z.ZodError([]),
        success: false,
    };
    return response;
}
