import type z from "zod";
export declare class Path {
    /**
     * The raw path string
     */
    private key;
    /**
     * The current path
     */
    private path;
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
     * Compare the equality of two paths
     */
    is(path: Path | string | Array<number | string | symbol>): boolean;
    /**
     * Pick the property with this key from an object
     *
     * @param schema Zod schema
     */
    pickFrom<ObjectType = Record<string, any>>(obj: ObjectType): any | undefined;
    /**
     * Get a specific zod schema shape from the current key
     *
     * @param schema Zod schema
     */
    toSchema<SchemaType = z.ZodType>(schema: z.ZodInterface<any>): SchemaType | undefined;
    toString(): string;
}
