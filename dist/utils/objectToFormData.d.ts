/**
 * Parse a POJO to form data
 *
 * @param object The object to parse
 * @param formData The form data object to append to
 * @param path The current path in the object (used for recursion)
 * @param transform A function to transform the value of each field
 */
export declare function objectToFormData(object: any, formData?: FormData, path?: string, transform?: (key: string, value: any) => FormDataEntryValue | undefined): FormData;
