export class Path {
    /**
     * The raw path string
     */
    key;
    /**
     * The current path
     */
    path = [];
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
     * Compare the equality of two paths
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
