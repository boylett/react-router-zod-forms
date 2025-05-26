import { FileUpload } from "@mjackson/form-data-parser";
import { z } from "zod/v4";
import { FileUploadFormData } from "../utils/fileUploadFormData";
import type { Replace } from "../utils/types";
/**
 * Hook options for a given schema
 */
type HandleZodFormOptions<SchemaType extends z.ZodObject<any>> = {
    /**
     * Maximum file size for multipart data
     */
    maxFileSize?: number;
    /**
     * Maximum header size for multipart data
     */
    maxHeaderSize?: number;
    /**
     * Default response messages
     */
    messages?: {
        /**
         * Default message to send when there is an error
         */
        error?: string;
        /**
         * Default message to send when a handler was not called
         */
        notImplemented?: string;
        /**
         * Default message to send when the action succeeded
         */
        success?: string;
    };
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
};
/**
 * Form handlers for a given schema
 */
type HandleZodFormForms<SchemaType extends z.ZodObject<any>, PayloadTypes extends {
    [key in "default" | keyof SchemaType["_zod"]["def"]["shape"]]: any;
}> = {
    [Intent in "default" | keyof z.output<SchemaType>]?: (props: Intent extends "default" ? HandleZodFormResponsePayloadType<any, PayloadTypes["default"]> : HandleZodFormResponsePayloadType<Replace<SchemaType["_zod"]["def"]["shape"][Intent], File, FileUpload>, PayloadTypes[Intent]>) => Promise<(Intent extends "default" ? HandleZodFormMessage<any, PayloadTypes["default"]> | any : HandleZodFormMessage<Replace<SchemaType["_zod"]["def"]["shape"][Intent], File, FileUpload>, PayloadTypes[Intent]>) | void>;
};
/**
 * Event hook handlers for a given schema
 */
type HandleZodFormHooks<SchemaType extends z.ZodObject<any>> = {
    [key in `${"after" | "before"}${"Upload" | "Validate" | ""}`]?: key extends "after" | "before" ? (data: FileUploadFormData) => void : key extends "afterValidate" ? (result?: z.ZodSafeParseResult<z.output<SchemaType>>) => z.ZodSafeParseResult<z.output<SchemaType>> | void : key extends "beforeValidate" ? (data?: z.output<SchemaType>) => z.output<SchemaType> | void : () => void;
};
/**
 * The message relayed back to the browser following a handled form action
 */
export interface HandleZodFormMessage<SchemaType extends z.ZodObject<any>, PayloadType = any> {
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
    validation: z.ZodSafeParseResult<z.output<SchemaType>>;
}
/**
 * The payload delivered to each form action
 */
export type HandleZodFormResponsePayloadType<SchemaType extends z.ZodObject<any>, PayloadType = any> = {
    /**
     * Form data validated and parsed with Zod
     */
    data: Replace<z.output<SchemaType>, File, FileUpload>;
    /**
     * Raw form data with unhandled file upload instances
     */
    formData: FileUploadFormData;
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
    validation: z.ZodSafeParseResult<z.output<SchemaType>>;
};
/**
 * Handle Zod Form submission
 */
export declare function handleZodForm<SchemaType extends z.ZodObject<Record<string, z.ZodObject<any>>>, PayloadTypes extends {
    [key in "default" | keyof SchemaType["_zod"]["def"]["shape"]]?: any;
}>(options: HandleZodFormOptions<SchemaType>, forms: HandleZodFormForms<SchemaType, PayloadTypes>, hooks?: HandleZodFormHooks<SchemaType>): Promise<Response | HandleZodFormMessage<any, PayloadTypes["default"]> | HandleZodFormMessage<SchemaType["_zod"]["def"]["shape"][keyof SchemaType["_zod"]["def"]["shape"]], PayloadTypes[keyof SchemaType["_zod"]["def"]["shape"]]>>;
export {};
