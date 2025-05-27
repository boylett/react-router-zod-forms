import type { FileUpload } from "@mjackson/form-data-parser";
import type { AllHTMLAttributes, ElementType, ForwardRefExoticComponent, HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode, RefAttributes, RefObject, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { FetcherFormProps, FetcherSubmitFunction, FormProps } from "react-router";
import type { Get } from "type-fest/source/get";
import type { IsPlainObject } from "type-fest/source/internal";
import type { Paths } from "type-fest/source/paths";
import type z from "zod/v4";
import type { FileUploadFormData } from "./utils/fileUploadFormData";

/**
 * Replace all instances of `From` with `To` in `Object`
 */
type Replace<Object, From, To> =
  Object extends From
  ? To
  : Object extends Array<infer U>
  ? Array<Replace<U, From, To>>
  : IsPlainObject<Object> extends true
  ? { [ K in keyof Object ]: Replace<Object[ K ], From, To> }
  : Object;

/**
 * React Router Zod Forms types
 */
export namespace ZodForms {
  /**
   * Components for Zod Forms
   */
  export namespace Components {
    /**
     * Field component
     */
    export namespace Field {
      /**
       * Props for the Field component
       */
      export type Props<
        SchemaType extends z.ZodObject<any>,
        FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }>,
        FieldValue = Get<z.output<SchemaType>, FieldPath>,
        FieldType = (
          FieldValue extends boolean
          ? "hidden" | "image" | "checkbox" | "radio"
          : FieldValue extends Date
          ? "hidden" | "image" | "date" | "datetime" | "datetime-local" | "month" | "time" | "week"
          : FieldValue extends File
          ? "hidden" | "image" | "file"
          : FieldValue extends number
          ? "hidden" | "image" | "number" | "range"
          : FieldValue extends Array<any>
          ? "select"
          : HTMLInputTypeAttribute | "select" | "textarea"
        )
      > = Omit<
        FieldValue extends Array<any>
        ? Omit<
          SelectHTMLAttributes<HTMLSelectElement>,
          | "defaultValue"
          | "multiple"
          | "value"
        >
        : Omit<
          InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>,
          | "defaultValue"
          | "value"
        >,
        | "children"
        | "name"
        | "type"
      > & {
        /**
         * Renders a custom component for the field with passthrough attributes
         * 
         * @param props Element attributes passed through to the component
         * @param shape (optional) The schema for this field
         */
        children?: ReactNode | (
          (
            props: any,
            shape: z.ZodType | Record<string, undefined>
          ) => ReactNode
        );

        /**
         * The default value of this input
         */
        defaultValue?: FieldValue;

        /**
         * The name of the field in the schema
         */
        name?: FieldPath;

        /**
         * Whether the field should be read only
         */
        readOnly?: boolean;

        /**
         * Field element reference
         */
        ref?: RefObject<
          (
            FieldType extends "select"
            ? HTMLSelectElement
            : FieldType extends "textarea"
            ? HTMLTextAreaElement
            : HTMLInputElement
          ) | null
        >;

        /**
         * The type of the field
         */
        type?: FieldType;

        /**
         * The controlled value of this input
         */
        value?: FieldValue;
      };
    }

    /**
     * Form component
     */
    export namespace Form {
      /**
       * Props for the Form component
       */
      export interface Props<
        SchemaType extends z.ZodObject<any>
      > extends FormProps {
        /**
         * Whether to embed the current intent as a hidden field
         * 
         * @remarks
         * Defaults to `true`
         */
        intent?: boolean;

        /**
         * Called when data returns from the action
         */
        onResponse?: (data: any) => void;

        /**
         * Called during form data validation
         */
        onValidate?: (data: z.output<SchemaType>, validation: z.ZodSafeParseResult<z.output<SchemaType>>) => void;

        /**
         * Form element reference
         */
        ref?: RefObject<HTMLFormElement | null>;
      }
    }

    /**
     * Message component
     */
    export namespace Message {
      /**
       * Props for the Message component
       */
      export namespace Props {
        /**
         * Props for the Message component with a `name` attribute
         */
        export interface Field<
          SchemaType extends z.ZodObject<any>,
          FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }>,
        > extends Omit<
          AllHTMLAttributes<HTMLElement>,
          | "as"
          | "children"
          | "name"
        > {
          /**
           * The element type to render
           * 
           * @remarks
           * Ignored if `children` prop is supplied.
           */
          as?: ElementType;

          /**
           * Renders a custom component for the message with passthrough attributes
           * 
           * @param props Element attributes passed through to the component
           * @param shape The schema for this field
           * @param issues The Zod issues for this field
           */
          children?: (
            props: any,
            shape: z.ZodType<Get<z.output<SchemaType>, FieldPath>, Get<z.input<SchemaType>, FieldPath>>,
            issues: z.core.$ZodIssue[],
          ) => ReactNode;

          /**
           * The name of the field in the schema
           */
          name: FieldPath | `${ FieldPath }.*` | "*";

          /**
           * Message element reference
           */
          ref?: RefObject<HTMLElement | null>;
        }

        /**
         * Props for the Message component without a `name` attribute
         */
        export interface Form<
          PayloadType,
          SchemaType extends z.ZodObject<any>,
        > extends Omit<
          AllHTMLAttributes<HTMLElement>,
          | "as"
          | "children"
          | "name"
        > {
          /**
           * The element type to render
           * 
           * @remarks
           * Ignored if `children` prop is supplied.
           */
          as?: ElementType;

          /**
           * Renders a custom component for the message with passthrough attributes
           * 
           * @param props Element attributes passed through to the component
           * @param schema The schema for the form
           * @param message The response message object
           */
          children?: (
            props: any,
            schema: SchemaType,
            message: ZodForms.Response<SchemaType, PayloadType>,
          ) => ReactNode;

          /**
           * The name of the field in the schema
           */
          name?: never;

          /**
           * Message element reference
           */
          ref?: RefObject<HTMLElement | null>;
        }
      }

      /**
       * Props for the Message component
       */
      export type Props<
        PayloadType,
        SchemaType extends z.ZodObject<any>,
        FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }>,
      > = ZodForms.Components.Message.Props.Field<
        SchemaType,
        FieldPath
      > | ZodForms.Components.Message.Props.Form<
        PayloadType,
        SchemaType
      >;
    }
  }

  /**
   * Context for Zod Forms
   */
  export namespace Context {
    /**
     * Fetcher context for Zod Forms
     */
    export type Fetcher<
      DataType = any,
      SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
      FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
    > = {
      /**
       * Fetcher response data
       */
      data?: DataType;

      /**
       * Configure which events trigger validation
       * 
       * @remarks
       * Defaults to `[ "change", "form.submit" ]`
       */
      events: ("blur" | "change" | "form.blur" | "form.input" | "form.submit" | "input")[];

      /**
       * The form element
       */
      form?: RefObject<HTMLFormElement | null>;

      /**
       * The form's unique identifier
       */
      id: string;

      /**
       * The form's schema intent
       */
      intent: string;

      /**
       * Loads data from a route. Useful for loading data imperatively inside of user events outside of a normal button or form, like a combobox or search input.
       * 
       * ```tsx
       * let fetcher = useFetcher()
       * 
       * <input onChange={e => {
       *   fetcher.load(`/search?q=${e.target.value}`)
       * }} />
       * ```
       */
      load: (href: string, opts?: {
        /**
         * Wraps the initial state update for this `fetcher.load` in a
         * `ReactDOM.flushSync` call instead of the default `React.startTransition`.
         * This allows you to perform synchronous DOM actions immediately after the
         * update is flushed to the DOM.
         */
        flushSync?: boolean;
      }) => Promise<void>;

      /**
       * Zod schema for the form
       */
      schema: SchemaType;

      /**
       * Fetcher load state
       */
      state: "idle" | "loading" | "submitting";

      /**
       * Submits form data to a route. While multiple nested routes can match a URL, only the leaf route will be called.
       * 
       * The `formData` can be multiple types:
       * 
       * - [`FormData`][form_data] - A `FormData` instance.
       * - [`HTMLFormElement`][html_form_element] - A [`<form>`][form_element] DOM element.
       * - `Object` - An object of key/value pairs that will be converted to a `FormData` instance by default. You can pass a more complex object and serialize it as JSON by specifying `encType: "application/json"`. See [`useSubmit`][use-submit] for more details.
       * 
       * If the method is `GET`, then the route [`loader`][loader] is being called and with the `formData` serialized to the url as [`URLSearchParams`][url_search_params]. If `DELETE`, `PATCH`, `POST`, or `PUT`, then the route [`action`][action] is being called with `formData` as the body.
       * 
       * ```tsx
       * // Submit a FormData instance (GET request)
       * const formData = new FormData();
       * fetcher.submit(formData);
       * 
       * // Submit the HTML form element
       * fetcher.submit(event.currentTarget.form, {
       *   method: "POST",
       * });
       * 
       * // Submit key/value JSON as a FormData instance
       * fetcher.submit(
       *   { serialized: "values" },
       *   { method: "POST" }
       * );
       * 
       * // Submit raw JSON
       * fetcher.submit(
       *   {
       *     deeply: {
       *       nested: {
       *         json: "values",
       *       },
       *     },
       *   },
       *   {
       *     method: "POST",
       *     encType: "application/json",
       *   }
       * );
       * ```
       */
      submit: FetcherSubmitFunction;

      /**
       * Validate the form
       */
      validate: (callback?: (data: z.output<SchemaType>, validation: z.ZodSafeParseResult<z.core.output<SchemaType>>) => void) => z.ZodSafeParseResult<z.core.output<SchemaType>> | undefined;

      /**
       * Zod validation response
       */
      validation?: z.ZodSafeParseResult<z.core.output<SchemaType>>;

      /**
       * Field component
       */
      Field: (props: ZodForms.Components.Field.Props<SchemaType, FieldPath>) => React.JSX.Element;

      /**
       * Form component
       */
      Form: (props: ZodForms.Components.Form.Props<SchemaType>) => React.JSX.Element;

      /**
       * Pure fetcher form component
       */
      FormElement?: ForwardRefExoticComponent<FetcherFormProps & RefAttributes<HTMLFormElement>>;

      /**
       * Message component
       */
      Message: (
        props: ZodForms.Components.Message.Props<
          DataType extends ZodForms.Response<SchemaType>
          ? DataType[ "payload" ]
          : DataType,
          SchemaType,
          FieldPath
        >
      ) => React.JSX.Element;
    };

    /**
     * Form context for Zod Forms
     */
    export type Form<
      DataType = any,
      SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
      FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
    > = {
      /**
       * Action data
       */
      data?: DataType;

      /**
       * Configure which events trigger validation
       * 
       * @remarks
       * Defaults to `[ "change", "form.submit" ]`
       */
      events: ("blur" | "change" | "form.blur" | "form.input" | "form.submit" | "input")[];

      /**
       * The form element
       */
      form?: RefObject<HTMLFormElement | null>;

      /**
       * The form's unique identifier
       */
      id: string;

      /**
       * The form's schema intent
       */
      intent: string;

      /**
       * Zod schema for the form
       */
      schema: SchemaType;

      /**
       * Navigation state
       */
      state: "idle" | "loading" | "submitting";

      /**
       * Validate the form
       */
      validate: (callback?: (data: z.output<SchemaType>, validation: z.ZodSafeParseResult<z.core.output<SchemaType>>) => void) => z.ZodSafeParseResult<z.core.output<SchemaType>> | undefined;

      /**
       * Zod validation response
       */
      validation?: z.ZodSafeParseResult<z.core.output<SchemaType>>;

      /**
       * Field component
       */
      Field: (props: ZodForms.Components.Field.Props<SchemaType, FieldPath>) => React.JSX.Element;

      /**
       * Form component
       */
      Form: (props: ZodForms.Components.Form.Props<SchemaType>) => React.JSX.Element;

      /**
       * Pure form component
       */
      FormElement?: ForwardRefExoticComponent<FetcherFormProps & RefAttributes<HTMLFormElement>>;

      /**
       * Message component
       */
      Message: (
        props: ZodForms.Components.Message.Props<
          DataType extends ZodForms.Response<SchemaType>
          ? DataType[ "payload" ]
          : DataType,
          SchemaType,
          FieldPath
        >
      ) => React.JSX.Element;
    };
  }

  /**
   * Return type of the Zod Forms context
   */
  export type Context<
    DataType = any,
    SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
    FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
  > =
    | ZodForms.Context.Fetcher<DataType, SchemaType, FieldPath>
    | ZodForms.Context.Form<DataType, SchemaType, FieldPath>;

  /**
   * Types for the `handleZodForm` function
   */
  export namespace HandleZodForm {
    /**
     * Form handlers for a given schema
     */
    export type Forms<
      SchemaType extends z.ZodObject<any>,
      PayloadTypes extends { [ key in "default" | keyof SchemaType[ "_zod" ][ "def" ][ "shape" ] ]: any; },
    > = {
        [ Intent in "default" | keyof z.output<SchemaType> ]?: (
          props: Intent extends "default"
            ? ZodForms.Response.Payload<any, PayloadTypes[ "default" ]>
            : ZodForms.Response.Payload<Replace<SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ], File, FileUpload>, PayloadTypes[ Intent ]>
        ) => Promise<
          (
            Intent extends "default"
            ? ZodForms.Response<any, PayloadTypes[ "default" ]> | any
            : ZodForms.Response<Replace<SchemaType[ "_zod" ][ "def" ][ "shape" ][ Intent ], File, FileUpload>, PayloadTypes[ Intent ]>
          ) | void
        >;
      };

    /**
    * Event hook handlers for a given schema
    */
    export type Hooks<
      SchemaType extends z.ZodObject<any>,
    > = {
        [ key in `${ "after" | "before" }${ "Upload" | "Validate" | "" }` ]?:
        key extends "after" | "before"
        ? (data: FileUploadFormData) => void
        : key extends "afterValidate"
        ? (result?: z.ZodSafeParseResult<z.output<SchemaType>>) => z.ZodSafeParseResult<z.output<SchemaType>> | void
        : key extends "beforeValidate"
        ? (data?: z.output<SchemaType>) => z.output<SchemaType> | void
        : () => void
      };

    /**
     * Hook options for a given schema
     */
    export type Options<
      SchemaType extends z.ZodObject<any>,
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
      transform?: (key: string, value: any, path: (number | string)[]) => any;
    };
  }

  /**
   * The message relayed back to the browser following a handled form action
   */
  export namespace Response {
    /**
     * The payload delivered to each form action
     */
    export type Payload<
      SchemaType extends z.ZodObject<any>,
      PayloadType = any,
    > = {
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
      response: ZodForms.Response<SchemaType, PayloadType>;

      /**
       * Form validation result
       */
      validation: z.ZodSafeParseResult<z.output<SchemaType>>;
    };
  }

  /**
   * The message relayed back to the browser following a handled form action
   */
  export interface Response<
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
   * Types for the `useZodForm` hook
   */
  export namespace UseZodForm {
    /**
     * Return type of the useZodForm hook
     */
    export type Fetcher<
      DataType = any,
      SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
      FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
    > = Pick<
      ZodForms.Context.Fetcher<
        DataType,
        SchemaType,
        FieldPath
      >,
      | "data"
      | "id"
      | "intent"
      | "load"
      | "schema"
      | "state"
      | "submit"
      | "validate"
      | "validation"
      | "Field"
      | "Form"
      | "Message"
    >;

    /**
    * Return type of the useZodForm hook
    */
    export type Form<
      DataType = any,
      SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
      FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
    > = Pick<
      ZodForms.Context.Form<
        DataType,
        SchemaType,
        FieldPath
      >,
      | "data"
      | "id"
      | "intent"
      | "schema"
      | "state"
      | "validate"
      | "validation"
      | "Field"
      | "Form"
      | "Message"
    >;
    /**
     * Options for the useZodForms hook
     */
    export namespace Options {
      /**
       * Options for the useZodForms hook
       */
      export interface Fetcher<
        SchemaType extends z.ZodObject<any>,
        Intent extends keyof z.output<SchemaType[ "_zod" ][ "def" ][ "shape" ]>,
      > {
        /**
         * Configure which events trigger validation
         * 
         * @remarks
         * Defaults to `[ "blur", "form.submit" ]`
         */
        events?: ZodForms.Context[ "events" ];

        /**
         * The current form intent
         */
        intent: Intent;

        /**
         * The Zod schema used to validate form data
         */
        schema: SchemaType;

        /**
         * Whether to use a fetcher for this form
         * 
         * @remarks
         * Defaults to `false`.
         */
        useFetcher: true;
      }

      /**
      * Options for the useZodForms hook
      */
      export interface Form<
        SchemaType extends z.ZodObject<any>,
        Intent extends keyof z.output<SchemaType[ "_zod" ][ "def" ][ "shape" ]>,
      > {
        /**
         * Configure which events trigger validation
         * 
         * @remarks
         * Defaults to `[ "blur", "form.submit" ]`
         */
        events?: ZodForms.Context[ "events" ];

        /**
         * The current form intent
         */
        intent: Intent;

        /**
         * The Zod schema used to validate form data
         */
        schema: SchemaType;

        /**
         * Whether to use a fetcher for this form
         * 
         * @remarks
         * Defaults to `false`.
         */
        useFetcher?: false;
      }
    }

    /**
     * Options for the useZodForms hook
     */
    export type Options<
      SchemaType extends z.ZodObject<any>,
      Intent extends keyof z.output<SchemaType[ "_zod" ][ "def" ][ "shape" ]>,
    > =
      | ZodForms.UseZodForm.Options.Fetcher<SchemaType, Intent>
      | ZodForms.UseZodForm.Options.Form<SchemaType, Intent>;
  }

  /**
   * Return type of the useZodForm hook
   */
  export type UseZodForm<
    DataType = any,
    SchemaType extends z.ZodObject<any> = z.ZodObject<any>,
    FieldPath extends Paths<z.output<SchemaType>, { bracketNotation: true; }> = Paths<z.output<SchemaType>, { bracketNotation: true; }>
  > =
    | ZodForms.UseZodForm.Fetcher<DataType, SchemaType, FieldPath>
    | ZodForms.UseZodForm.Form<DataType, SchemaType, FieldPath>;
}
