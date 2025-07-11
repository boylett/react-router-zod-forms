import { Path } from "../index.js";
/**
 * Parse form data to a POJO
 *
 * @param input The form data to parse
 * @param transform A function to transform the value of each field
 */
export function formDataToObject(input, transform) {
    if ("onsubmit" in input) {
        input = new FormData(input);
    }
    const output = {};
    input.forEach((value, key) => {
        const path = Path.split(key);
        let current = output;
        if (transform) {
            value = transform(key, value, path);
        }
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            if (key !== undefined) {
                if (key === "[]") {
                    if (!Array.isArray(current)) {
                        current = [current];
                    }
                    current.push(value);
                    continue;
                }
                if (i === path.length - 1) {
                    if (Array.isArray(current)) {
                        current.push(value);
                    }
                    else {
                        current[key] = value;
                    }
                }
                else {
                    if (!(key in current)) {
                        current[key] = path[i + 1] === "[]" || typeof path[i + 1] === "number"
                            ? []
                            : {};
                    }
                    current = current[key];
                }
            }
        }
    });
    return output;
}
//# sourceMappingURL=formDataToObject.js.map