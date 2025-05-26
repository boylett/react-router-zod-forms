import type { FileUpload } from "@mjackson/form-data-parser";

/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
 * 
 * This class extends the native FormData class to handle multipart file uploads specifically.
 * 
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
 */
export class FileUploadFormData extends FormData {
  /**
   * Multipart file uploads
   */
  private files: Map<string, FileUpload> = new Map();

  /**
   * Iterate through all values in the form data, including file uploads
   */
  override forEach (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any) {
    return super.forEach(
      (value, key, parent) => {
        if (key.startsWith("$FileUpload::")) {
          const fileKey = key.substring(13);
          const fileUpload = this.files.get(fileKey);

          if (fileUpload) {
            callbackfn(fileUpload, fileKey, parent);
          }
        }

        else {
          callbackfn(value, key, parent);
        }
      },
      thisArg
    );
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/FormData/get)
   */
  override get (key: string): FileUpload | FormDataEntryValue | null {
    if (key.startsWith("$FileUpload::")) {
      return this.files.get(key.substring(13)) || null;
    }

    return super.get(key);
  }

  /**
   * Append a file upload to this FormData instance
   * 
   * @param key Field key
   * @param file FileUpload instance
   */
  appendFile (key: string, file: FileUpload): void {
    this.files.set(key, file);

    super.append(`$FileUpload::${ key }`, file);
  }
}