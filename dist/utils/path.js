export class Path {
    /**
     * The raw path string
     */
    key;
    /**
     * The current path
     */
    path = [];
    /**
     * This path's segment length
     */
    length;
    constructor(key) {
        if (Array.isArray(key)) {
            key = key
                .map(key => typeof key === "number"
                ? `[${key}]`
                : `.${String(key)}`)
                .join("")
                .replace(/^\./, "");
        }
        if (key instanceof Path) {
            key = key.key;
        }
        this.key = key;
        this.path = Path.split(this.key);
        this.length = this.path.length;
    }
    /**
     * Split a path string into an array
     *
     * @remarks
     * Safely ignores escaped delimiters such as `\\.` and `\\[`.
     *
     * @example
     * ```ts
     * Path.split("foo.bar.baz"); // ["foo", "bar", "baz"]
     * Path.split("foo\\.bar.baz[1]"); // ["foo.bar", "baz", 1]
     * Path.split("foo[0].bar[].baz"); // ["foo", 0, "bar", "[]", "baz"]
     * Path.split("foo[0].bar\\[1\\]"); // ["foo", 0, "bar[1]"]
     * ```
     *
     * @param path The path string to split
     */
    static split(path) {
        if (!path) {
            return [];
        }
        const result = [];
        let token = "";
        let i = 0;
        while (i < path.length) {
            if (path[i] === "\\") {
                token += path[++i] ?? "";
            }
            else if (path[i] === ".") {
                if (token) {
                    result.push(token);
                }
                token = "";
            }
            else if (path[i] === "[") {
                if (path[i + 1] === "]" && path[i - 1] !== "\\") {
                    if (token) {
                        result.push(token);
                    }
                    result.push("[]");
                    token = "";
                    i += 1;
                }
                else {
                    const end = path.indexOf("]", i);
                    if (end === -1) {
                        throw new Error(`Unmatched [ in path: ${path}`);
                    }
                    const content = path.slice(i + 1, end);
                    const index = parseInt(content, 10);
                    if (isNaN(index)) {
                        throw new Error(`Invalid index: [${content}] in path: ${path}`);
                    }
                    if (token) {
                        result.push(token);
                    }
                    result.push(index);
                    token = "";
                    i = end;
                }
            }
            else {
                token += path[i];
            }
            i++;
        }
        if (token) {
            result.push(token);
        }
        return result.filter(part => part !== "");
    }
    /**
     * Get the path segment at the specified index
     *
     * @param index The index of the path segment to retrieve
     */
    at(index) {
        return this.path[index];
    }
    /**
     * Determine whether this path ends with another path
     *
     * @param key The path to compare with
     */
    endsWith(key) {
        const compare = new Path(key);
        for (let index = this.length - 1; index >= 0; index--) {
            if (this.path[index] !== compare.at(index)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Compare the equality of two paths
     *
     * @param path The path to compare with
     */
    is(path) {
        return this.key === new Path(path).toString();
    }
    /**
     * Pick the property with this key from an object
     *
     * @param schema Zod schema
     */
    pickFrom(obj) {
        if (!this.key) {
            return undefined;
        }
        return this.path
            .reduce((current, segment) => {
            if (current === undefined || current === null) {
                return undefined;
            }
            if (segment === "[]") {
                return Array.isArray(current)
                    ? current[0]
                    : undefined;
            }
            else {
                return current[segment];
            }
        }, obj);
    }
    /**
     * Determine whether this path starts with another path
     *
     * @param key The path to compare with
     */
    startsWith(key) {
        const compare = new Path(key);
        for (let index = 0; index < this.length; index++) {
            if (this.path[index] !== compare.at(index)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Prettify this key
     *
     * @param delimiter (optional) Delimiter string – defaults to an ASCII space
     * @param format (optional) A function to format each key
     *
     * @remarks
     * - Increases each numeric array index by 1
     * - Capitalizes the first letter of each string key
     * - Separates keys with a delimiter
     */
    toPrettyString(delimiter = " ", format) {
        return this.path
            .map(format || (key => (typeof key === "number"
            ? key + 1
            : (String(key)
                .split(/[\s-_;:,\.]/g)
                .map(word => String(word).substring(0, 1).toUpperCase() + String(word).substring(1))
                .join(delimiter)))))
            .join(delimiter);
    }
    /**
     * Get a specific zod schema shape from the current key
     *
     * @param schema Zod schema
     */
    toSchema(schema) {
        if (!this.key) {
            return undefined;
        }
        // Retrieve the schema shape for this field based on path keys
        return this.path
            .reduce((currentSchema, key) => {
            if (typeof key === "number" || key === "[]") {
                if (currentSchema?.def && "type" in currentSchema.def && currentSchema.def.type === "array" && "element" in currentSchema.def) {
                    return currentSchema.def.element;
                }
                return currentSchema;
            }
            if (currentSchema?.def?.shape && key in currentSchema.def.shape) {
                return currentSchema.def.shape[key];
            }
            return currentSchema;
        }, schema);
    }
    toString() {
        return String(this.key);
    }
}
//# sourceMappingURL=Path.js.map