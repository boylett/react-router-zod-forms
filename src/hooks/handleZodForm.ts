import { FileUpload } from "@mjackson/form-data-parser";
import { getMultipartBoundary, isMultipartRequest, MultipartParseError, parseMultipart } from "@mjackson/multipart-parser";
import { z } from "zod/v4";
import { formDataToObject } from "../utils/formDataToObject";
import type { Replace } from "../utils/types";

/**
 * Hook options for a given schema
 */
type HandleZodFormOptions<
  SchemaType extends z.ZodObject<any>,
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

  /**
   * A function to handle file uploads
   * 
   * @param file The file to upload
   * @param formData The current form data payload
   */
  uploadHandler?: (file: FileUpload, formData: FormData) => Promise<UploadHandlerReturnType> | UploadHandlerReturnType;
};

/**
 * Form handlers for a given schema
 */
type HandleZodFormForms<
  SchemaType extends z.ZodObject<any>,
  UploadHandlerReturnType extends Blob | null | string | void,
  PayloadTypes extends { [ key in "default" | keyof SchemaType[ "_zod" ][ "def" ][ "shape" ] ]: any; },
> = {
    [ Intent in "default" | keyof z.output<SchemaType> ]?: (
      props: Intent extends "default"
        ? HandleZodFormResponsePayloadType<any, PayloadTypes[ "default" ]>
        : HandleZodFormResponsePayloadType<Replace<SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ], File, UploadHandlerReturnType>, PayloadTypes[ Intent ]>
    ) => Promise<
      (
        Intent extends "default"
        ? HandleZodFormMessage<any, PayloadTypes[ "default" ]> | any
        : HandleZodFormMessage<Replace<SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ], File, UploadHandlerReturnType>, PayloadTypes[ Intent ]>
      ) | void
    >;
  };

/**
 * Event hook handlers for a given schema
 */
type HandleZodFormHooks<
  SchemaType extends z.ZodObject<any>,
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
    ? (result?: z.ZodSafeParseResult<z.output<SchemaType>>) => z.ZodSafeParseResult<z.output<SchemaType>> | void
    : key extends "beforeValidate"
    ? (data?: z.output<SchemaType>) => z.output<SchemaType> | void
    : () => void
  };

/**
 * The message relayed back to the browser following a handled form action
 */
export interface HandleZodFormMessage<
  SchemaType extends z.ZodObject<any>,
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
  validation: z.ZodSafeParseResult<z.output<SchemaType>>;
}

/**
 * The payload delivered to each form action
 */
export type HandleZodFormResponsePayloadType<
  SchemaType extends z.ZodObject<any>,
  PayloadType = any,
> = {
  /**
   * Form data validated and parsed with Zod
   */
  data: z.output<SchemaType>;

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
  validation: z.ZodSafeParseResult<z.output<SchemaType>>;
};

/**
 * Handle Zod Form submission
 */
export async function handleZodForm<
  SchemaType extends z.ZodObject<Record<string, z.ZodObject<any>>>,
  PayloadTypes extends { [ key in "default" | keyof SchemaType[ "_zod" ][ "def" ][ "shape" ] ]: any; },
  UploadHandlerReturnType extends Blob | null | string | void,
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
    SchemaType[ "_zod" ][ "def" ][ "shape" ][ keyof SchemaType[ "_zod" ][ "def" ][ "shape" ] ],
    PayloadTypes[ keyof SchemaType[ "_zod" ][ "def" ][ "shape" ] ]
  >
> {
  const {
    maxFileSize,
    maxHeaderSize,
    messages,
    request,
    schema,
    transform,
    uploadHandler,
  } = options;

  let formData = new FormData();

  // If this is a multipart request, upload files and extract form data
  if (isMultipartRequest(request)) {
    // If the request body is empty
    if (!request.body) {
      throw new Error("Request body is empty");
    }

    // Get the multipart boundary
    const boundary = getMultipartBoundary(
      request.headers.get("Content-Type") as string
    );

    // If there is no boundary, throw an error
    if (!boundary) {
      throw new MultipartParseError("Invalid Content-Type header: missing boundary");
    }

    let multipartFiles: {
      fieldName: string;
      file: FileUpload;
    }[] = [];

    // Parse regular form data first and save uploadable files for later
    await parseMultipart(
      request.body,
      {
        boundary,
        maxFileSize,
        maxHeaderSize,
      },
      async part => {
        if (part.name && !part.isFile) {
          formData.append(part.name, await part.text());
        }

        else if (part.name && part.isFile) {
          multipartFiles.push({
            fieldName: part.name,
            file: new FileUpload(part)
          });
        }
      }
    );

    // Handle file uploads in parallel with access to form data
    await Promise.all(
      multipartFiles.map(
        async ({ fieldName, file }) => {
          const hookFile = (
            await hooks?.beforeUpload?.(file)
          );

          if (hookFile) {
            file = hookFile;
          }

          const handle = (
            await (
              uploadHandler || (
                async (file: FileUpload) =>
                  new File(
                    [ await file.arrayBuffer() ],
                    file.name,
                    {
                      lastModified: file.lastModified,
                      type: file.type,
                    }
                  )
              )
            )(
              file,
              formData
            )
          ) as UploadHandlerReturnType;

          const hookHandle = (
            await hooks?.afterUpload?.(handle)
          );

          if (hookHandle) {
            formData.append(fieldName, hookHandle);
          }

          else if (handle) {
            formData.append(fieldName, handle);
          }
        }
      )
    );
  }

  // If this is not a multipart request, we can just use the form data from the request
  else {
    formData = (
      await request.formData()
    );
  }

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
        "intent" in thrown &&
        "message" in thrown &&
        "status" in thrown &&
        "validation" in thrown
      )
    ) {
      return thrown as HandleZodFormMessage<SchemaType>;
    }

    throw thrown;
  }

  const intent = (
    formData.get("_intent") as string ?? "default"
  ) as (
      "default" | Extract<keyof z.output<SchemaType>, string>
    );

  formData.delete("_intent");

  let data: any = (
    formDataToObject(formData, transform)
  );

  let validation: z.ZodSafeParseResult<z.output<SchemaType>> = {
    data,
    error: new z.ZodError([]),
    success: false,
  };

  let response: HandleZodFormMessage<SchemaType> = {
    intent,
    message: messages?.success || "Success",
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
          "intent" in thrown &&
          "message" in thrown &&
          "status" in thrown &&
          "validation" in thrown
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
          "intent" in thrown &&
          "message" in thrown &&
          "status" in thrown &&
          "validation" in thrown
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

        else if (
          thrown &&
          typeof thrown === "object" &&
          (
            "intent" in thrown &&
            "message" in thrown &&
            "status" in thrown &&
            "validation" in thrown
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

        else if (
          thrown &&
          typeof thrown === "object" &&
          (
            "intent" in thrown &&
            "message" in thrown &&
            "status" in thrown &&
            "validation" in thrown
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