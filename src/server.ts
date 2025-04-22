import { parseFormData, type FileUpload } from "@mjackson/form-data-parser";
import z from "zod";
import { formDataToObject } from "./utils/formDataToObject";
import type { Replace } from "./utils/types";

export interface HandleZodFormRequest<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | File | null | string | void
> {
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
}

/**
 * The message relayed back to the browser following a handled form action
 */
export interface HandleZodFormMessage<
  SchemaType extends z.ZodInterface<any>
> {
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
export type HandleZodFormResponsePayloadType<
  SchemaType extends z.ZodInterface<any>
> = {
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
type HandleZodFormForms<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | File | null | string | void,
> = {
    [ Intent in "default" | keyof z.infer<SchemaType> ]?: (
      props: Intent extends "default"
        ? HandleZodFormResponsePayloadType<Replace<SchemaType, File, UploadHandlerReturnType>>
        : HandleZodFormResponsePayloadType<Replace<SchemaType[ "def" ][ "shape" ][ Intent ], File, UploadHandlerReturnType>>
    ) => Promise<
      (
        Intent extends "default"
        ? HandleZodFormMessage<Replace<SchemaType, File, UploadHandlerReturnType>> | any
        : HandleZodFormMessage<Replace<SchemaType[ "def" ][ "shape" ][ Intent ], File, UploadHandlerReturnType>>
      ) | void
    >;
  };

/**
 * Event hook handlers for a given schema
 */
type HandleZodFormHooks<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | File | null | string | void,
> = {
    [ key in `${ "after" | "before" }${ "Upload" | "Validate" | "" }` ]?:
    key extends "after" | "before"
    ? (data: FormData) => void
    : key extends "afterUpload"
    ? (data?: UploadHandlerReturnType) => Promise<UploadHandlerReturnType> | UploadHandlerReturnType
    : key extends "beforeUpload"
    ? (data: FileUpload) => Promise<FileUpload | void> | FileUpload | void
    : key extends "afterValidate"
    ? (result?: z.ZodSafeParseResult<z.infer<SchemaType>>) => z.ZodSafeParseResult<z.infer<SchemaType>> | void
    : key extends "beforeValidate"
    ? (data?: z.infer<SchemaType>) => z.infer<SchemaType> | void
    : () => void
  };

/**
 * Handle Zod Form submission
 */
export async function handleZodForm<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | File | null | string | void = File,
  FormsType extends HandleZodFormForms<SchemaType, UploadHandlerReturnType> = HandleZodFormForms<SchemaType, UploadHandlerReturnType>
> (
  props: HandleZodFormRequest<SchemaType, UploadHandlerReturnType>,
  forms: FormsType,
  hooks?: HandleZodFormHooks<SchemaType, UploadHandlerReturnType>
): Promise<
  | HandleZodFormMessage<SchemaType | SchemaType[ "def" ][ "shape" ][ Extract<keyof z.infer<SchemaType>, string> ]>
  | ReturnType<Exclude<FormsType[ "default" ], undefined>>
  | Partial<HandleZodFormMessage<SchemaType>>
> {
  const {
    maxFileSize,
    maxHeaderSize,
    request,
    schema,
    transform,
    uploadHandler,
  } = props;

  const formData = (
    await parseFormData(
      request,
      {
        maxFileSize,
        maxHeaderSize,
      },
      async file => {
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
      }
    )
  );

  hooks?.before?.(formData);

  const intent = (
    formData.get("_intent") as string ?? "default"
  ) as (
      "default" | Extract<keyof z.infer<SchemaType>, string>
    );

  let data = (
    formDataToObject(formData, transform)
  );

  let validation: any = {
    data,
    error: new z.ZodError([]),
    success: false,
  };

  if (intent !== "default" && intent in schema.def.shape && intent in forms && forms[ intent ]) {
    const hookData = (
      hooks?.beforeValidate?.(data)
    );

    if (hookData) {
      data = hookData;
    }

    validation = (
      await schema.def.shape[ intent ].safeParseAsync(data)
    );

    const hookResult = (
      hooks?.afterValidate?.(validation)
    );

    if (hookResult) {
      validation = hookResult;
    }

    if (validation) {
      validation.data ||= data;
    }

    const response: any = {
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
      const action = (
        await forms[ intent ](payload) || undefined
      );

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
    const response: any = {
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
      const action = (
        await forms.default(payload) || undefined
      );

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

  console.error(`Unhandled form submission for intent '${ intent as string }' in ${ request.url }`);

  hooks?.after?.(formData);

  return {
    intent,
    message: "Not Implemented",
    payload: null,
    status: 501,
    validation: undefined,
  } as Partial<HandleZodFormMessage<SchemaType>>;
}