/**
 * Parse a POJO to form data
 *
 * @param object The object to parse
 * @param formData The form data object to append to
 * @param path The current path in the object (used for recursion)
 * @param transform A function to transform the value of each field
 */
export function objectToFormData (
  object: any,
  formData: FormData = new FormData(),
  path = "",
  transform?: (key: string, value: any) => FormDataEntryValue | undefined
): FormData {
  if (object === null || object === undefined) {
    return formData;
  }

  // Only plain objects and arrays are traversed; anything else is a leaf value
  const traverse = Array.isArray(object) || (
    typeof object === "object" &&
    (object.constructor === Object || object.constructor === undefined)
  );

  if (!traverse) {
    const value = transform
      ? transform(path, object)
      : object;

    if (value !== undefined) {
      formData.append(
        path,
        value instanceof Blob || value instanceof File
          ? value
          : value instanceof Date
            ? value.toISOString()
            : String(value)
      );
    }
  }

  else if (Array.isArray(object)) {
    object.forEach(
      (value, i) =>
        objectToFormData(value, formData, `${ path }[${ i }]`, transform)
    );
  }

  else {
    Object.entries(object).forEach(
      ([ key, value ]) => {
        const newPath = path ? `${ path }.${ key }` : key;

        objectToFormData(value, formData, newPath, transform);
      }
    );
  }

  return formData;
}
