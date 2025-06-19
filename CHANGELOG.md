# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### To Do

- Implement class-based handler execution so that we can perform `this.<handler>(props)` from inside other handlers and access and update config options like `messages.error` or `maxFileSize` etc.

## [1.1.6] - 2025-06-19

### Changed

- Changed the order of type parameters for `useZodForm` to be more in line with `handleZodForm`

## [1.1.5] - 2025-06-19

### Fixed

- Fixed response data not matching correct form intent
- Fixed validation result not correctly received from server when using a fetcher

## [1.1.4] - 2025-06-19

### Fixed

- Fixed validation result not up-to-date in handler response

## [1.1.3] - 2025-06-17

### Improved

- Patch TypeScript annotations [development only]

## [1.1.2] - 2025-06-17

### Improved

- Patch TypeScript annotations [development only]
- Updated dependencies

## [1.1.1] - 2025-05-27

### Fixed

- TypeScript config fixes
- Type fixes

## [1.1.0] - 2025-05-27

### Changed

- Reogranised type declarations – types are now all imported from `react-router-zod-forms/types`

### Improved

- Updated dependencies

## [1.0.0] - 2025-05-26

### Changed

- Removed `uploadHandler` method in favor of simply providing `FileUpload` instances to handlers directly via a custom `FormData` implementation

### Added

- `objectToFormData` helper method for rehydrating form data

### Fixed

- `handleZodForm` payload type keys are now all optional when specifying payload types
- Moved `handleZodForm` export to `react-router-zod-forms/server` (fixes vite SSR error)

### Improved

- Updated dependencies

## [0.0.14] - 2025-05-23

### Fixed

- Fixed dependency issues causing type errors

## [0.0.13] - 2025-05-23

### Added

- You can now provide your own default error/response text in `handleZodForm` using the new `messages` option
- Implemented `formData` access for `uploadHandler` method

### Fixed

- Fixed error in `Form` component when checking for `defaultPrevented`

### Improved

- Improved error message response catching
- Demoted dependencies to peer dependencies
- Updated dependencies

## [0.0.12] - 2025-05-14

### Changed

- Improved type safety for `default` handler
- Prettified field keys now convert symbol delimited text to camel case (eg: `field_name` → `Field Name`)

### Added

- Added [BEM](https://getbem.com) className identifiers to custom components

### Fixed

- Fixed error in `Field` component when checking for `defaultPrevented`

### Improved

- Updated dependencies

## [0.0.11] - 2025-05-13

### Changed

- `useFetcher` is now `false` by default
- Stronger typing for `useZodForm` return type based on `useFetcher` option

### Added

- `intent` prop for `Form` component to enable or disable automatic intent field

## [0.0.10] - 2025-05-05

### Changed

- Changed `handleZodForm` return type to include `Response`
- When a `Response` is `throw`n inside a form handler, it is now caught and returned automatically

### Added

- Use of a fetcher for form submission can now be disabled via the `useFetcher` option on `useZodForm`

## [0.0.9] - 2025-05-04

### Changed

- Default validation events are now `blur` and `form.submit`

### Added

- React `ref` forwarding for `Field`, `Form` and `Message` components
- Schema shape parameter for `Field` and `Message` component functional children

### Improved

- Updated dependencies
- Stronger typing for `Field` and `Message` component functional children

## [0.0.8] - 2025-04-24

### Added

- Catchall wildcard to display all validation messages with `<Message name="*" />`

## [0.0.7] - 2025-04-24

### Added

- Validation event constraints

### Fixed

- Added `key` attribute to default `Message` contents

## [0.0.6] - 2025-04-24

### Changed

- Restructured exports
- Removed `/server` exports
- Refactored file structure for clarity
- Prevent form submission if client-side validation fails
- Changed default success message from `"ok"` to `"Success"`

### Added

- `<Message />` component
- `aria-invalid` attribute for invalid fields
- `validation` prop returned by `useZodForm`

### Fixed

- Fixed a bug where action data could potentially pollute other forms
- Fixed a bug where action data was not loaded correctly during SSR
- Fixed a bug with regular expression HTML attribute formatting
- Fixed a bug where validation attributes were not added for optional types

## [0.0.5] - 2025-04-22

### Added

- Documentation
- Type safety for root level schema

## [0.0.4] - 2025-04-22

### Added

- Better type safety for fetcher data response
- Better type safety for data response payload
- Better error handling
- Added `formData` to form handler arguments
- Added `intent` to form handler arguments

## [0.0.3] - 2025-04-22

### Added

- Type safety for `File` instances parsed with `uploadHandler`
- `beforeUpload` and `afterUpload` hooks
- `onResponse` handler on `Form` component

### Changed

- Schemas should be a standard `ZodObject` rather than a custom structure
- Handling multiple forms now means calling `useZodForm` multiple times rather than picking from the schema
- Utilise default file upload handler if none specified
- Rename exported components `ZodForm` and `ZodField` to `Form` and `Field` respectively

## [0.0.2] - 2025-04-21

### Added

- GitHub package meta
- Give `before` and `after` handler hooks access to current `formData`
- Pass `load` and `submit` props from form fetchers to contextual output

### Fixed

- Fixed type bug with intent-bound field names
- Validation should not be optional in form handler methods

## [0.0.1] - 2025-04-20

### Added

- `useZodForm()` client-side method with strong typing
- `handleZodForm()` server-side method with strong typing
- `createZodFormSchema()` method with strong typing
- `<ZodForm />` React component with strong typing
- `<ZodFormField />` React component with strong typing