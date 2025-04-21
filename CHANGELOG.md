# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Aria attributes for invalid fields

### Changed

- Schemas should be a standard `ZodInterface` rather than a custom structure
- Handling multiple forms now means calling `useZodForm` multiple times rather than picking from the schema

## [0.0.2-beta] - 2025-04-21

### Added

- GitHub package meta
- Give `before` and `after` handler hooks access to current `formData`
- Pass `load` and `submit` props from form fetchers to contextual output

### Fixed

- Fixed type bug with intent-bound field names
- Validation should not be optional in form handler methods

## [0.0.1-beta] - 2025-04-20

### Added

- `useZodForm()` client-side method with strong typing
- `handleZodForm()` server-side method with strong typing
- `createZodFormSchema()` method with strong typing
- `<ZodForm />` React component with strong typing
- `<ZodFormField />` React component with strong typing