import React, { type ForwardRefExoticComponent, type ReactNode, type RefAttributes, type RefObject } from "react";
import type { FetcherFormProps, FetcherSubmitFunction } from "react-router";
import type { Paths } from "type-fest";
import type { z } from "zod/v4";
import type { ZodFormFieldProps } from "../components/Field";
import type { ZodFormProps } from "../components/Form";
import type { ZodFormMessageProps } from "../components/Message";
import type { HandleZodFormMessage } from "../hooks/handleZodForm";
export type ZodFormsContextTypeFetcher<DataType = any, SchemaType extends z.ZodObject<any> = z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = {
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
    Field: (props: ZodFormFieldProps<SchemaType, FieldPath>) => React.JSX.Element;
    /**
     * Form component
     */
    Form: (props: ZodFormProps<SchemaType>) => React.JSX.Element;
    /**
     * Pure fetcher form component
     */
    FormElement?: ForwardRefExoticComponent<FetcherFormProps & RefAttributes<HTMLFormElement>>;
    /**
     * Message component
     */
    Message: (props: ZodFormMessageProps<DataType extends HandleZodFormMessage<SchemaType> ? DataType["payload"] : DataType, SchemaType, FieldPath>) => React.JSX.Element;
};
export type ZodFormsContextTypeForm<DataType = any, SchemaType extends z.ZodObject<any> = z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = {
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
    Field: (props: ZodFormFieldProps<SchemaType, FieldPath>) => React.JSX.Element;
    /**
     * Form component
     */
    Form: (props: ZodFormProps<SchemaType>) => React.JSX.Element;
    /**
     * Pure form component
     */
    FormElement?: ForwardRefExoticComponent<FetcherFormProps & RefAttributes<HTMLFormElement>>;
    /**
     * Message component
     */
    Message: (props: ZodFormMessageProps<DataType extends HandleZodFormMessage<SchemaType> ? DataType["payload"] : DataType, SchemaType, FieldPath>) => React.JSX.Element;
};
export type ZodFormsContextType<DataType = any, SchemaType extends z.ZodObject<any> = z.ZodObject<any>, FieldPath extends Paths<z.output<SchemaType>, {
    bracketNotation: true;
}> = Paths<z.output<SchemaType>, {
    bracketNotation: true;
}>> = ZodFormsContextTypeFetcher<DataType, SchemaType, FieldPath> | ZodFormsContextTypeForm<DataType, SchemaType, FieldPath>;
/**
 * Context for ZodForms
 */
export declare const ZodFormsContext: React.Context<{
    /**
     * The current forums in the document
     */
    forms?: React.RefObject<Record<string, Partial<ZodFormsContextType>>>;
}>;
/**
 * ZodForm context provider
 *
 * @remarks
 * This should be embedded at the application level. Wrap your `<App />` with `<ZodFormProvider>`.
 */
export declare function ZodFormProvider({ children }: {
    children: ReactNode;
}): React.JSX.Element;
