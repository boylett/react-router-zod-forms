import { Path } from "../index.js";

/**
 * Field name segments that would let submitted data reach the prototype chain
 */
const FORBIDDEN_KEYS = new Set([ "__proto__", "constructor", "prototype" ]);

/**
 * Parse form data to a POJO
 *
 * @param input The form data to parse
 * @param transform A function to transform the value of each field
 */
export function formDataToObject<
  Type = any
> (
  input: HTMLFormElement | FormData,
  transform?: (key: string, value: any, path: (number | string)[]) => any
): Type {
  if ("onsubmit" in input) {
    input = new FormData(input);
  }

  // A holder whose `value` is reassignable, so a top-level array or index can replace the root
  const root: { value: any; } = { value: undefined };

  input.forEach(
    (value, key) => {
      const path = Path.split(key);

      // Drop any field whose name would target the prototype chain
      if (path.some(segment => typeof segment === "string" && FORBIDDEN_KEYS.has(segment))) {
        return;
      }

      if (transform) {
        value = transform(key, value, path);
      }

      if (path.length === 0) {
        return;
      }

      let parent: any = root;
      let parentKey: number | string = "value";

      for (let i = 0; i < path.length; i++) {
        const segment = path[ i ];

        if (segment === undefined) {
          continue;
        }

        const isLast = i === path.length - 1;

        // The container this segment indexes into lives at parent[ parentKey ];
        // create it lazily, typed by the segment ([]/number -> array, key -> object)
        if (parent[ parentKey ] === undefined || parent[ parentKey ] === null) {
          parent[ parentKey ] = segment === "[]" || typeof segment === "number"
            ? []
            : {};
        }

        const container: any = parent[ parentKey ];

        // Unindexed "[]" segments append rather than address a fixed slot
        if (segment === "[]") {
          if (isLast) {
            container.push(value);

            continue;
          }

          // Start a fresh element for this occurrence and descend into it
          container.push(
            path[ i + 1 ] === "[]" || typeof path[ i + 1 ] === "number"
              ? []
              : {}
          );

          parent = container;
          parentKey = container.length - 1;

          continue;
        }

        // Concrete object key or numeric array index
        if (isLast) {
          container[ segment ] = value;

          continue;
        }

        parent = container;
        parentKey = segment;
      }
    }
  );

  return (
    root.value === undefined
      ? {}
      : root.value
  ) as Type;
}
