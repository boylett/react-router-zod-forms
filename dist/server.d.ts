import { type FileUpload } from "@mjackson/form-data-parser";
import z from "zod";
import type { Replace } from "./utils/types";
/**
 * Hook options for a given schema
 */
type HandleZodFormOptions<SchemaType extends z.ZodInterface<any>, UploadHandlerReturnType extends Blob | File | null | string | void> = {
    /**
     * Maximum file size for multipart data
     */
    maxFileSize?: number;
    /**
     * Maximum header size for multipart data
     */
    maxHeaderSize?: number;
    /**
     * The request object
     */
    request: Request;
    /**
     * The form schema
     */
    schema: SchemaType;
    /**
     * A function to transform the value of each formData field before it is parsed by Zod
     */
    transform?: (key: string, value: FormDataEntryValue, path: (number | string)[]) => any;
    /**
     * A function to handle file uploads
     */
    uploadHandler?: (file: FileUpload) => Promise<UploadHandlerReturnType> | UploadHandlerReturnType;
};
/**
 * Form handlers for a given schema
 */
type HandleZodFormForms<SchemaType extends z.ZodInterface<any>, UploadHandlerReturnType extends Blob | File | null | string | void, PayloadTypes extends {
    [key in keyof SchemaType["def"]["shape"]]: any;
}> = {
    [Intent in "default" | keyof z.infer<SchemaType>]?: (props: Intent extends "default" ? HandleZodFormResponsePayloadType<Replace<SchemaType, File, UploadHandlerReturnType>, PayloadTypes[Intent]> : HandleZodFormResponsePayloadType<Replace<SchemaType["def"]["shape"][Intent], File, UploadHandlerReturnType>, PayloadTypes[Intent]>) => Promise<(Intent extends "default" ? HandleZodFormMessage<Replace<SchemaType, File, UploadHandlerReturnType>, PayloadTypes[Intent]> | any : HandleZodFormMessage<Replace<SchemaType["def"]["shape"][Intent], File, UploadHandlerReturnType>, PayloadTypes[Intent]>) | void>;
};
/**
 * Event hook handlers for a given schema
 */
type HandleZodFormHooks<SchemaType extends z.ZodInterface<any>, UploadHandlerReturnType extends Blob | File | null | string | void> = {
    [key in `${"after" | "before"}${"Upload" | "Validate" | ""}`]?: key extends "after" | "before" ? (data: FormData) => void : key extends "afterUpload" ? (data?: UploadHandlerReturnType) => Promise<UploadHandlerReturnType> | UploadHandlerReturnType : key extends "beforeUpload" ? (data: FileUpload) => Promise<FileUpload | void> | FileUpload | void : key extends "afterValidate" ? (result?: z.ZodSafeParseResult<z.infer<SchemaType>>) => z.ZodSafeParseResult<z.infer<SchemaType>> | void : key extends "beforeValidate" ? (data?: z.infer<SchemaType>) => z.infer<SchemaType> | void : () => void;
};
/**
 * The message relayed back to the browser following a handled form action
 */
export interface HandleZodFormMessage<SchemaType extends z.ZodInterface<any>, PayloadType = any> {
    /**
     * The submitted form intent
     */
    intent: string;
    /**
     * Success/error message
     */
    message: string;
    /**
     * Action data payload
     */
    payload?: PayloadType;
    /**
     * HTTP status code
     */
    status: 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
    /**
     * Form validation result
     */
    validation: z.ZodSafeParseResult<z.infer<SchemaType>>;
}
/**
 * The payload delivered to each form action
 */
export type HandleZodFormResponsePayloadType<SchemaType extends z.ZodInterface<any>, PayloadType = any> = {
    /**
     * Form data validated and parsed with Zod
     */
    data: z.infer<SchemaType>;
    /**
     * Raw, unparsed form data
     */
    formData: FormData;
    /**
     * The submitted form intent
     */
    intent: string;
    /**
     * Form response object
     */
    response: HandleZodFormMessage<SchemaType, PayloadType>;
    /**
     * Form validation result
     */
    validation: z.ZodSafeParseResult<z.infer<SchemaType>>;
};
/**
 * Handle Zod Form submission
 */
export declare function handleZodForm<SchemaType extends z.ZodInterface<Record<string, z.ZodInterface<any>>>, PayloadTypes extends {
    [key in keyof SchemaType["def"]["shape"]]: any;
}, UploadHandlerReturnType extends Blob | File | null | string | void = File>(props: HandleZodFormOptions<SchemaType, UploadHandlerReturnType>, forms: HandleZodFormForms<SchemaType, UploadHandlerReturnType, PayloadTypes>, hooks?: HandleZodFormHooks<SchemaType, UploadHandlerReturnType>): Promise<HandleZodFormMessage<SchemaType, PayloadTypes["default"]> | HandleZodFormMessage<SchemaType["def"]["shape"][keyof SchemaType["def"]["shape"]], PayloadTypes[keyof SchemaType["def"]["shape"]]>>;
export {};
