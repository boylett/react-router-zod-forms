/**
 * Parse form data to a POJO
 *
 * @param input The form data to parse
 * @param transform A function to transform the value of each field
 */
export declare function formDataToObject<Type = any>(input: HTMLFormElement | FormData, transform?: (key: string, value: FormDataEntryValue, path: (number | string)[]) => any): Type;
