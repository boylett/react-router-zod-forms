import { parseFormData, type FileUpload } from "@mjackson/form-data-parser";
import z from "zod";
import { formDataToObject } from "../utils/formDataToObject";
import type { Replace } from "../utils/types";

/**
 * Hook options for a given schema
 */
type HandleZodFormOptions<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | null | string | void,
> = {
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
type HandleZodFormForms<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | null | string | void,
  PayloadTypes extends { [ key in "default" | keyof SchemaType[ "def" ][ "shape" ] ]: any; },
> = {
    [ Intent in "default" | keyof z.infer<SchemaType> ]?: (
      props: Intent extends "default"
        ? HandleZodFormResponsePayloadType<any, PayloadTypes[ "default" ]>
        : HandleZodFormResponsePayloadType<Replace<SchemaType[ "def" ][ "shape" ][ Intent ], File, UploadHandlerReturnType>, PayloadTypes[ Intent ]>
    ) => Promise<
      (
        Intent extends "default"
        ? HandleZodFormMessage<any, PayloadTypes[ "default" ]> | any
        : HandleZodFormMessage<Replace<SchemaType[ "def" ][ "shape" ][ Intent ], File, UploadHandlerReturnType>, PayloadTypes[ Intent ]>
      ) | void
    >;
  };

/**
 * Event hook handlers for a given schema
 */
type HandleZodFormHooks<
  SchemaType extends z.ZodInterface<any>,
  UploadHandlerReturnType extends Blob | null | string | void,
> = {
    [ key in `${ "after" | "before" }${ "Upload" | "Validate" | "" }` ]?:
    key extends "after" | "before"
    ? (data: FormData) => void
    : key extends "afterUpload"
    ? (file?: UploadHandlerReturnType) => Promise<UploadHandlerReturnType> | UploadHandlerReturnType
    : key extends "beforeUpload"
    ? (file: FileUpload) => Promise<FileUpload | void> | FileUpload | void
    : key extends "afterValidate"
    ? (result?: z.ZodSafeParseResult<z.infer<SchemaType>>) => z.ZodSafeParseResult<z.infer<SchemaType>> | void
    : key extends "beforeValidate"
    ? (data?: z.infer<SchemaType>) => z.infer<SchemaType> | void
    : () => void
  };

/**
 * The message relayed back to the browser following a handled form action
 */
export interface HandleZodFormMessage<
  SchemaType extends z.ZodInterface<any>,
  PayloadType = any,
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
export type HandleZodFormResponsePayloadType<
  SchemaType extends z.ZodInterface<any>,
  PayloadType = any,
> = {
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
export async function handleZodForm<
  SchemaType extends z.ZodInterface<Record<string, z.ZodInterface<any>>>,
  PayloadTypes extends { [ key in "default" | keyof SchemaType[ "def" ][ "shape" ] ]: any; },
  UploadHandlerReturnType extends Blob | null | string | void = File,
> (
  options: HandleZodFormOptions<SchemaType, UploadHandlerReturnType>,
  forms: HandleZodFormForms<SchemaType, UploadHandlerReturnType, PayloadTypes>,
  hooks?: HandleZodFormHooks<SchemaType, UploadHandlerReturnType>
): Promise<
  | Response
  | HandleZodFormMessage<
    any,
    PayloadTypes[ "default" ]
  >
  | HandleZodFormMessage<
    SchemaType[ "def" ][ "shape" ][ keyof SchemaType[ "def" ][ "shape" ] ],
    PayloadTypes[ keyof SchemaType[ "def" ][ "shape" ] ]
  >
> {
  const {
    maxFileSize,
    maxHeaderSize,
    request,
    schema,
    transform,
    uploadHandler,
  } = options;

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

  try {
    hooks?.before?.(formData);
  }

  catch (thrown) {
    if (thrown instanceof Response) {
      return thrown;
    }

    else if (
      thrown &&
      typeof thrown === "object" &&
      (
        "message" in thrown ||
        "status" in thrown
      )
    ) {
      return thrown as HandleZodFormMessage<SchemaType>;
    }

    throw thrown;
  }

  const intent = (
    formData.get("_intent") as string ?? "default"
  ) as (
      "default" | Extract<keyof z.infer<SchemaType>, string>
    );

  formData.delete("_intent");

  let data: any = (
    formDataToObject(formData, transform)
  );

  let validation: z.ZodSafeParseResult<z.infer<SchemaType>> = {
    data,
    error: new z.ZodError([]),
    success: false,
  };

  let response: HandleZodFormMessage<SchemaType> = {
    intent,
    message: "Success",
    payload: null,
    status: 200,
    validation,
  };

  if (intent !== "default" && intent in schema.def.shape && intent in forms && forms[ intent ]) {
    try {
      const hookData = (
        hooks?.beforeValidate?.(data)
      );

      if (hookData) {
        data = hookData;
      }
    }

    catch (thrown) {
      if (thrown instanceof Response) {
        return thrown;
      }

      else if (
        thrown &&
        typeof thrown === "object" &&
        (
          "message" in thrown ||
          "status" in thrown
        )
      ) {
        return thrown as HandleZodFormMessage<SchemaType>;
      }

      throw thrown;
    }

    validation = (
      await schema.def.shape[ intent ].safeParseAsync(data)
    );

    try {
      const hookResult = (
        hooks?.afterValidate?.(validation)
      );

      if (hookResult) {
        validation = hookResult;
      }
    }

    catch (thrown) {
      if (thrown instanceof Response) {
        return thrown;
      }

      else if (
        thrown &&
        typeof thrown === "object" &&
        (
          "message" in thrown ||
          "status" in thrown
        )
      ) {
        return thrown as HandleZodFormMessage<SchemaType>;
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
      const action = (
        await forms[ intent ](payload as any) || undefined
      );

      if (!action) {
        return response;
      }

      return action;
    }

    catch (thrown) {
      if (thrown instanceof Response) {
        return thrown;
      }

      response.message = "error";
      response.payload = thrown;
      response.status = 500;

      return response;
    }

    finally {
      try {
        hooks?.after?.(formData);
      }

      catch (thrown) {
        if (thrown instanceof Response) {
          return thrown;
        }

        else if (
          thrown &&
          typeof thrown === "object" &&
          (
            "message" in thrown ||
            "status" in thrown
          )
        ) {
          return thrown as HandleZodFormMessage<SchemaType>;
        }

        throw thrown;
      }
    }
  }

  if ("default" in forms && forms.default) {
    const payload: HandleZodFormResponsePayloadType<SchemaType> = {
      data,
      formData,
      intent,
      response,
      validation,
    };

    try {
      const action = (
        await forms.default(payload as any) || undefined
      );

      if (!action) {
        return response;
      }

      return action;
    }

    catch (thrown) {
      if (thrown instanceof Response) {
        return thrown;
      }

      response.message = "error";
      response.payload = thrown;
      response.status = 500;

      return response;
    }

    finally {
      try {
        hooks?.after?.(formData);
      }

      catch (thrown) {
        if (thrown instanceof Response) {
          return thrown;
        }

        else if (
          thrown &&
          typeof thrown === "object" &&
          (
            "message" in thrown ||
            "status" in thrown
          )
        ) {
          return thrown as HandleZodFormMessage<SchemaType>;
        }

        throw thrown;
      }
    }
  }

  console.trace();

  console.error(`Unhandled form submission for intent '${ intent as string }' in ${ request.url }`);

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