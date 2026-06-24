import { FileUpload, MaxFilesExceededError } from "@mjackson/form-data-parser";
import { getMultipartBoundary, isMultipartRequest, MultipartParseError, parseMultipartRequest } from "@mjackson/multipart-parser";
import { z } from "zod";
import { formDataToObject } from "../utils/formDataToObject.js";
/**
 * Handle Zod Form submission
 */
export async function handleZodForm(options, forms, hooks) {
    const { maxFiles = 20, maxFileSize, maxHeaderSize, messages, request, schema, transform, } = options;
    // Handler execution context, exposed as `this` inside each form handler
    const context = {};
    // Expose every handler so a handler can call its siblings via `this.<handler>(props)`
    for (const key of Object.keys(forms)) {
        const handler = forms[key];
        if (typeof handler === "function") {
            context[key] = (props) => handler.call(context, props);
        }
    }
    // Expose configuration for reading, and message overrides for mutation, via `this`
    Object.assign(context, {
        maxFiles,
        maxFileSize,
        maxHeaderSize,
        messages: messages ?? {},
        request,
        schema,
        transform,
    });
    // Custom form data handler
    const formData = new FormData();
    // If this is a multipart request, extract form data and handle file uploads
    if (isMultipartRequest(request)) {
        // If the request body is empty
        if (!request.body) {
            throw new Error("Request body is empty");
        }
        // Get the multipart boundary
        const boundary = getMultipartBoundary(request.headers.get("Content-Type"));
        // If there is no boundary, throw an error
        if (!boundary) {
            throw new MultipartParseError("Invalid Content-Type header: missing boundary");
        }
        let fileCount = 0;
        // Parse regular form data first and save uploadable files for later
        for await (let part of parseMultipartRequest(request, { maxFileSize, maxHeaderSize })) {
            if (part.name && part.isFile) {
                if (++fileCount > maxFiles) {
                    throw new MaxFilesExceededError(maxFiles);
                }
                if (part.filename && part.size > 0) {
                    formData.append(part.name, new FileUpload(part, part.name));
                }
            }
            else if (part.name && part.isText) {
                formData.append(part.name, part.text);
            }
        }
    }
    // If this is not a multipart request, we can just use the form data from the request
    else {
        const data = (await request.formData());
        data.forEach((value, key) => formData.append(key, value));
    }
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
    let data = formDataToObject(formData, transform);
    let validation = {
        data,
        error: new z.ZodError([]),
        success: false,
    };
    let response = {
        intent,
        message: context.messages.success || "Success",
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
        if (schema.def.shape[intent]) {
            validation = await schema.def.shape[intent].safeParseAsync(data);
        }
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
            data = validation.data;
            response.validation = validation;
        }
        const payload = {
            data,
            formData,
            intent,
            response,
            validation,
        };
        let result;
        let pendingThrow;
        let hasPendingThrow = false;
        try {
            const action = (await forms[intent].call(context, payload) || undefined);
            result = action ?? response;
        }
        catch (thrown) {
            if (thrown instanceof Response) {
                result = thrown;
            }
            else if (thrown instanceof Error) {
                console.error(thrown);
                response.message = context.messages.error || "Error";
                response.payload = thrown;
                response.status = 500;
                result = response;
            }
            else {
                pendingThrow = thrown;
                hasPendingThrow = true;
            }
        }
        // Run the after hook outside of `finally` so it cannot swallow the handler result or error
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
        if (hasPendingThrow) {
            throw pendingThrow;
        }
        return result;
    }
    if ("default" in forms && forms.default) {
        const payload = {
            data,
            formData,
            intent,
            response,
            validation,
        };
        let result;
        let pendingThrow;
        let hasPendingThrow = false;
        try {
            const action = (await forms.default.call(context, payload) || undefined);
            result = action ?? response;
        }
        catch (thrown) {
            if (thrown instanceof Response) {
                result = thrown;
            }
            else if (thrown instanceof Error) {
                console.error(thrown);
                response.message = context.messages.error || "Error";
                response.payload = thrown;
                response.status = 500;
                result = response;
            }
            else {
                pendingThrow = thrown;
                hasPendingThrow = true;
            }
        }
        // Run the after hook outside of `finally` so it cannot swallow the handler result or error
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
        if (hasPendingThrow) {
            throw pendingThrow;
        }
        return result;
    }
    console.error(`Unhandled form submission for intent '${intent}' in ${request.url}`);
    response.message = context.messages.notImplemented || "Not Implemented";
    response.payload = null;
    response.status = 501;
    response.validation = {
        data,
        error: new z.ZodError([]),
        success: false,
    };
    return response;
}
//# sourceMappingURL=handleZodForm.js.map