<p align="center">
  <img alt="React Router Zod Forms" src="https://raw.githubusercontent.com/boylett/react-router-zod-forms/refs/heads/main/.github/logo.svg" width="100" height="100" style="max-width: 100%;">
</p>

<p align="center">
  Strongly typed form management with <a href="https://reactrouter.com">React Router 7</a> and <a href="https://v4.zod.dev">Zod 4</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-router-zod-forms"><img src="https://img.shields.io/npm/v/react-router-zod-forms" alt="View Package on NPM" /></a>
  <a href="https://github.com/boylett/react-router-zod-forms/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/react-router-zod-forms" alt="License" /></a>
</p>

---

> [!CAUTION]
> This library is very much not ready for production use yet. I am actively developing it alongside a large-scale real-world project.

---

# Documentation

**React Router Zod Forms** aims to simplify the process of handling form submission and validation with React Router and Zod 4.

> [!NOTE]
> Requires [React Router 7](https://reactrouter.com) and [zod 4](https://v4.zod.dev)

## Installation

```sh
npm install react-router-zod-forms
```

## Schema Creation

```typescript
import z from "zod";

const schema = z.interface({
  /**
   * General settings
   */
  general: z.interface({
    title: z
      .string()
      .meta({ description: "Page Title" }),
    
    content: z
      .string()
      .meta({ description: "Page Description" }),
    
    settings: z
      .array(
        z.coerce.string()
      )
      .meta({ description: "Page Settings" }),
  }),
});
```

> [!IMPORTANT]
> The root-level schema must consist of `interface` types only. Polluting the schema with non-`interface` types will cause a type error in `handleZodForm`.

## Server Handler

To handle form submission in a route action, use the `handleZodForm` method.

```typescript
import { handleZodForm } from "react-router-zod-forms";

export const action = async ({ context, params, request }: Route.ActionArgs) => {
  return await handleZodForm(
    {
      request,
      schema,
    },
    {
      async general ({
        data: {
          title,
          content,
          settings,
        },
        response,
        validation,
      }) {
        // `validation` contains zod's `safeParse` result
        if (validation.success) {
          await Page.updateOne(
            {
              slug: params.slug,
            },
            {
              $set: {
                title,
                content,
                settings,
              },
            }
          );

          // The `response` object can be mutated directly, you
          // don't have to return it but you can if you want
          response.message = `Changes to page '${title}' saved successfully`;

          // If you need to return a Response, ie. a redirect or
          // cookie header, simply throw it instead
          throw redirect(...);
          throw Response(...);

          // Throwing an Error will populate the `response` object
          // with the error message and return it with status 500
          throw new Error("Something went wrong!");
        }
      },
    }
  );
};
```

The `handleZodForm` method parses the current request for `FormData`, performs any required file uploads, and processes forms based on a given `intent`.

### Arguments

#### 1. `options` <sup>(required)</sup> – Form handler configuration object

| Property | Type | Effect |
| - | - | - |
| `options.request` <sup>(required)</sup> | `Request` | The current request |
| `options.schema` <sup>(required)</sup> | [`ZodInterface`](https://v4.zod.dev/api#objects) | Your zod schema object |
| `options.maxFileSize` | `number` | Set the maximum file size for file uploads (see [@mjackson/multipart-parser](https://github.com/mjackson/remix-the-web/tree/main/packages/multipart-parser#limiting-file-upload-size)) |
| `options.maxHeaderSize` | `number` | Set the maximum header size for multipart payloads (see [@mjackson/multipart-parser](https://github.com/mjackson/remix-the-web/blob/main/packages/multipart-parser/src/lib/multipart.ts#L18)) |
| `options.transform` | `function` | Transforms the value of each formData field before it is parsed by Zod (arguments are `key: string`, `value: FormDataEntryValue` and `path: (number \| string)[]`) |
| `options.uploadHandler` | `function` | Perform file uploads before the form is validated (see [@mjackson/form-data-parser](https://github.com/mjackson/remix-the-web/tree/main/packages/form-data-parser#usage)) |

#### 2. `forms` <sup>(required)</sup> – Form handlers corresponding to schema entries

For every `ZodInterface` within your schema, you can define a namesake form handler function inside the `forms` object. For instance;

```typescript
const schema = z.interface({
  primary: z.interface({ primary_title: z.string() }),
  secondary: z.interface({ secondary_title: z.string() }),
});

return await handleZodForm({ request, schema }, {
  async primary ({ data: { primary_title } }) { ... },
  async secondary ({ data: { secondary_title } }) { ... },
});
```

If you have some custom action functionality that happens outside of React Router Zod Forms, you should put it inside the `default` handler, like so;

```typescript
return await handleZodForm({ request, schema }, {
  async default ({ formData, intent }) {
    console.log(
      `Unhandled intent '${ intent }' with data:`, formData.entries()
    );
  },
  ...
});
```

> [!WARNING]
> Bare in mind that returning `handleZodForm` from your action will *always* return a `HandleZodFormMessage` object (see below), unless a `Response` is thrown.

#### 3. `hooks` – Event callbacks that help you modify the form data before and after it is parsed and validated

| Hook | Properties | Returns | Effect |
| - | - | - | - |
| `before` | `data: FormData` | | Called before form data is cast to a POJO and before validation occurs |
| `after` | `data: FormData` | | Called after all relevant handlers have executed |
| `beforeUpload` | `file: `[`FileUpload`](https://github.com/mjackson/remix-the-web/blob/main/packages/form-data-parser/src/lib/form-data.ts#L19) | <sub>[`FileUpload`](https://github.com/mjackson/remix-the-web/blob/main/packages/form-data-parser/src/lib/form-data.ts#L19)</sub> | Called before `options.uploadHandler`. May be used to mutate the file before upload |
| `afterUpload` | <sub>`file?: Blob \| null \| string`</sub> | <sub>`Blob \| null \| string`</sub> | Called before `options.uploadHandler`. May be used to mutate the file before upload |
| `beforeValidate` | <sub>`data?: z.infer<typeof schema>`</sub> | <sub>`z.infer<typeof schema>`</sub> | Called before zod validation. May be used to mutate the form data before validation |
| `afterValidate` | <sub>`result?: ZodSafeParseResult<z.infer<typeof schema>>`</sub> | <sub>`ZodSafeParseResult<z.infer<typeof schema>>`</sub> | Called after zod validation. May be used to mutate the validation response before action handling |

> [!NOTE]
> Hooks are not required to return a value

### Type Generics

The `handleZodForm` method accepts up to three type parameters;

| Generic | Type | Effect |
| - | - | - |
| `SchemaType` | `z.ZodInterface<Record<string, z.ZodInterface<any>>>` | Input schema type. Should be `typeof schema` in almost every case |
| `PayloadTypes` | `Record<keyof SchemaType[ "def" ][ "shape" ], any>` | Fetcher data payload type map |
| `UploadHandlerReturnType` | `Blob \| null \| string \| void` | Type constraint for the result of `uploadHandler` |

These type parameters are particularly useful when you need type safety for your form action's `data` payload (see [**Payload Type Safety**](#payload-type-safety)).

## Client Hook

Use the `useZodForm` hook to create a [fetcher](https://reactrouter.com/api/hooks/useFetcher#usefetcher) and form components for use on your page or in components.

It accepts a single argument – `options` – which requires `intent` <sup>(`string`)</sup> and `schema` <sup>(`ZodInterface`)</sup>.

```tsx
import { useZodForm } from "react-router-zod-forms";

export default function Component () {
  const {
    // Populated with action data
    data,

    // The form's unique identifier
    id,

    // The current form intent
    intent,

    // Passed through from the fetcher
    load,
    submit,

    // Fetcher state
    state,

    // Method to manually call client-side field validation
    validate,

    // Zod validation result
    validation,

    // Form components – more on these below
    Field,
    Form,
    Message,
  } = useZodForm(
    {
      intent: "general",
      schema,
    }
  );

  return (
    <>
      <Form action="?index" className="form">
        <Message />
        <fieldset>
          <legend>
            { schema.def.shape.general.def.shape.title.meta()?.description }
          </legend>
          <Field name="title" />
          <Message name="title" />
        </fieldset>
        <fieldset>
          <legend>
            { schema.def.shape.general.def.shape.content.meta()?.description }
          </legend>
          <Field name="content" type="textarea" />
          <Message name="content" />
        </fieldset>
        <fieldset>
          <legend>
            { schema.def.shape.general.def.shape.settings.meta()?.description }
          </legend>
          <Field name="settings[0]" />
          <Field name="settings[1]" />
          <Field name="settings[2]" />
          <Message name="settings.*" />
        </fieldset>
        <button disabled={
          state !== "idle"
        }>
          submit
        </button>
      </Form>
    </>
  );
}
```

### `<Form />` component

The `Form` component is an extension of React Router's [`Form`](https://reactrouter.com/api/components/Form) component.

It handles validation with zod and automatically inserts a hidden `intent` field so that `handleZodForm` knows which schema to use.

`Form` components set `method` to `post` by default but you can override this by adding your own `method` attribute;

```tsx
<Form method="get">
```

### `<Field />` component

The `Field` component is a wrapper for elements like `input`, `select` and `textarea` and should be used in place of said elements.

The `name` attribute is strongly typed to only accept valid keys from your schema, and the `value` and `type` attributes are typed accordingly.

To render a `select` field, you can set the `Field`'s `type` to `select` and add `option` elements as children directly to the `Field`;

```tsx
<Field name="select_field" type="select">
  <option value="option_1">Option 1</option>
  ...
</Field>
```

### `<Message />` component

The `Message` component displays response or validation data depending on its `name` attribute.

```tsx
<Message name="title" />
```

If `name` matches a valid field in your schema, the component will display any validation error messages relating to that field. You can end the name attribute with a wildcard (`.*`) to catch all errors nested within a given field.

```tsx
<Message name="settings.*" />
```

Omitting `name` will cause the component to display the `message` sent back from [`handleZorm`](#server-handler)'s `response` payload.

#### Objects

Schemas can be nested as deeply as you need. Field keys can reflect nested types using **dot notation**;

```tsx
<Field name="deeply.nested.field.name" />
```

#### Arrays

Handling array schemas is as simple as using **square bracket notation** for array indices;

```tsx
itemsState.map(
  (item, key) => (
    <Field key={ key } name={ `items[${ key }]` } defaultValue={ item.value } />
  )
)
```

And, of course, you can mix **dot and bracket notations** as required;

```tsx
itemsState.map(
  (item, key) => (
    <Field key={ key } name={ `deeply.nested.items[${ key }].name` } defaultValue={ item.name } />
  )
)
```

#### Custom Components

As custom components are commonplace in forms, `Field` components also accept a function in place of its `children` property. To render a custom `Select` component, for instance;

```tsx
<Field name="select_field">
  { (props: SelectProps) => (
    <Select { ...props }>
      <SelectItem>Option 1</SelectItem>
      ...
    </Select>
  ) }
</Field>
```

or, if you prefer;

```tsx
<Field
  name="select_field"
  children={
    (props: SelectProps) => (
      <Select { ...props }>
        <SelectItem>Option 1</SelectItem>
        ...
      </Select>
    )
  }
>
```

The same applies for the `Message` component, which receives additional properties that you should destructure accordingly;

For field messages, use the `issues` prop to access zod's validation issues list.

```tsx
<Message name="select_field">
  { ({ issues }) => (
    <div>
      <h4>Field contains <strong>{ issues.length }</strong> errors:</h4>
      <ul>
        { issues.map(issue => (
          <li>{ issue.message }</li>
        )) }
      </ul>
    </div>
  ) }
</Message>
```

For form messages, use the `message` prop to access the response payload from the server.

```tsx
<Message>
  { ({ message }) => (
    <p>
      <strong>
        { message.status === 200
          ? "Success"
          : "Error" }
      </strong>: { message.message }
    </p>
  ) }
</Message>
```

> [!WARNING]
> By default, `props` is typed as `AllHTMLAttributes<HTMLElement>`, but this may cause problems with your custom component's property types. If that's the case, utilize destructuring to deliver the properties you need;

```tsx
  { ({ name, required }) => (
    <Select name={ name } required={ required }>
      ...
```

## Payload Type Safety

Sometimes you need to deliver some extra data from your actions. The `response.payload` property can be used to deliver data to your forms like so;

```typescript
type SchemaPayloads = {
  primary: {
    enabled: boolean;
  };
};

               // Note the second type parameter ↴
return await handleZodForm<typeof schema, SchemaPayloads>({ request, schema }, {
  async primary ({ response }) {
    response.payload.enabled = true;
  },
});

export default function Component () {
                  // Note the second type parameter ↴
  const { data } = useZodForm<typeof schema, SchemaPayloads>({ intent: "general", schema });

  console.log(data.payload.enabled); // true
}
```

## Multiple Forms

You can create multiple forms on the same page by initializing each form as a variable rather than destructuring;

```tsx
const schema = z.interface({
  primary: z.interface({ primary_title: z.string() }),
  secondary: z.interface({ secondary_title: z.string() }),
});

export default function Component () {
  const primary = useZodForm({ intent: "primary", schema });
  const secondary = useZodForm({ intent: "secondary", schema });

  return (
    <>
      <primary.Form>
        { primary.data?.message && (
          <blockquote>
            { primary.data.message }
          </blockquote>
        ) }
        <fieldset>
          <legend>
            Primary Title
          </legend>
          <primary.Field name="primary_title" />
        </fieldset>
        <button disabled={
          primary.state !== "idle"
        }>
          submit
        </button>
      </primary.Form>

      <secondary.Form>
        { secondary.data?.message && (
          <blockquote>
            { secondary.data.message }
          </blockquote>
        ) }
        <fieldset>
          <legend>
            Secondary Title
          </legend>
          <secondary.Field name="secondary_title" />
        </fieldset>
        <button disabled={
          secondary.state !== "idle"
        }>
          submit
        </button>
      </secondary.Form>
    </>
  );
}
```

Or, I mean, if you're really fancy, you could just destructure *differently*. OoOoooOoo~

```tsx
export default function Component () {
  const { Form: PrimaryForm } = useZodForm({ intent: "primary", schema });
  const { Form: SecondaryForm } = useZodForm({ intent: "secondary", schema });

  return (
    <>
      <PrimaryForm>
        ...
```

# Contributing

If you're interested in contributing to React Router Zod Forms, please feel free to make a pull request!