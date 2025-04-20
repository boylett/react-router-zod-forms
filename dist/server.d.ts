import { parseFormData } from "@mjackson/form-data-parser";
import z from "zod";
import { formDataToObject } from "./utils/formDataToObject";
export interface HandleZodFormRequest<SchemaType extends z.ZodInterface<any>> {
    /**
     * Options for the form data parser
     */
    parserOptions?: Parameters<typeof parseFormData>[1];
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
    transform?: Parameters<typeof formDataToObject>[1];
    /**
     * A function to handle file uploads
     */
    uploadHandler?: Parameters<typeof parseFormData>[2];
}
/**
 * The message relayed back to the browser following a handled form action
 */
export interface HandleZodFormMessage<SchemaType extends z.ZodInterface<any>> {
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
    payload?: any;
    /**
     * HTTP status code
     */
    status: 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
    /**
     * Form validation result
     */
    validation: z.ZodSafeParseResult<Exclude<z.infer<SchemaType>, string>>;
}
/**
 * The payload delivered to each form action
 */
export type HandleZodFormResponsePayloadType<SchemaType extends z.ZodInterface<any>> = {
    /**
     * Posted form data
     */
    data: z.infer<SchemaType>;
    /**
     * Form response object
     */
    response: HandleZodFormMessage<SchemaType>;
    /**
     * Form validation result
     */
    validation: z.ZodSafeParseResult<z.infer<SchemaType>>;
};
/**
 * Form handlers for a given schema
 */
type HandleZodFormForms<SchemaType extends z.ZodInterface<any>> = {
    [Intent in "default" | Exclude<keyof z.infer<SchemaType>, "_intent">]?: (props: Intent extends "default" ? HandleZodFormResponsePayloadType<SchemaType> : HandleZodFormResponsePayloadType<SchemaType["def"]["shape"][Intent]>) => Promise<(Intent extends "default" ? HandleZodFormMessage<SchemaType> | any : HandleZodFormMessage<SchemaType["def"]["shape"][Intent]>) | void>;
};
/**
 * Event hook handlers for a given schema
 */
type HandleZodFormHooks<SchemaType extends z.ZodInterface<any>> = {
    [key in `${"after" | "before"}${"Validate" | ""}`]?: key extends "after" | "before" ? (data: FormData) => void : key extends "beforeValidate" ? (data?: z.infer<SchemaType>) => z.infer<SchemaType> | void : key extends "afterValidate" ? (result?: z.ZodSafeParseResult<z.infer<SchemaType>>) => z.ZodSafeParseResult<z.infer<SchemaType>> | void : () => void;
};
/**
 * Handle Zod Form submission
 */
export declare function handleZodForm<SchemaType extends z.ZodInterface<any>, FormsType extends HandleZodFormForms<SchemaType> = HandleZodFormForms<SchemaType>, HooksType extends HandleZodFormHooks<SchemaType> = HandleZodFormHooks<SchemaType>>(props: HandleZodFormRequest<SchemaType>, forms: FormsType, hooks?: HooksType): Promise<HandleZodFormMessage<SchemaType | SchemaType["def"]["shape"][Extract<keyof z.infer<SchemaType>, string>]> | ReturnType<Exclude<FormsType["default"], undefined>> | Partial<HandleZodFormMessage<SchemaType>>>;
export {};
