import type { FileUpload } from "@mjackson/form-data-parser";
/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
 *
 * This class extends the native FormData class to handle multipart file uploads specifically.
 *
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
 */
export declare class FileUploadFormData extends FormData {
    /**
     * Multipart file uploads
     */
    private files;
    /**
     * Iterate through all values in the form data, including file uploads
     */
    forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void;
    /**
     * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/FormData/get)
     */
    get(key: string): FileUpload | FormDataEntryValue | null;
    /**
     * Append a file upload to this FormData instance
     *
     * @param key Field key
     * @param file FileUpload instance
     */
    appendFile(key: string, file: FileUpload): void;
}
