import type { z } from "zod/v4";
export declare class Path {
    /**
     * The raw path string
     */
    private readonly key;
    /**
     * The current path
     */
    private readonly path;
    /**
     * This path's segment length
     */
    readonly length: number;
    constructor(key: Path | string | Array<number | string | symbol>);
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
    static split(path?: string): (string | number)[];
    /**
     * Get the path segment at the specified index
     *
     * @param index The index of the path segment to retrieve
     */
    at(index: number): string | number | undefined;
    /**
     * Determine whether this path ends with another path
     *
     * @param key The path to compare with
     */
    endsWith(key: Path | string | Array<number | string | symbol>): boolean;
    /**
     * Compare the equality of two paths
     *
     * @param path The path to compare with
     */
    is(path: Path | string | Array<number | string | symbol>): boolean;
    /**
     * Pick the property with this key from an object
     *
     * @param schema Zod schema
     */
    pickFrom<ObjectType = Record<string, any>>(obj: ObjectType): any | undefined;
    /**
     * Determine whether this path starts with another path
     *
     * @param key The path to compare with
     */
    startsWith(key: Path | string | Array<number | string | symbol>): boolean;
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
    toPrettyString(delimiter?: string, format?: (key: number | string) => string): string;
    /**
     * Get a specific zod schema shape from the current key
     *
     * @param schema Zod schema
     */
    toSchema<SchemaType = z.ZodType>(schema: z.ZodObject<any>): SchemaType | undefined;
    toString(): string;
}
