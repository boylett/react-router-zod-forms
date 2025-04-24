# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### To Do

- Remaining HTML validation attributes

## [Unreleased]

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

- Schemas should be a standard `ZodInterface` rather than a custom structure
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