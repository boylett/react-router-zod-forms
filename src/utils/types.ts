import type { IsPlainObject } from "type-fest/source/internal";

/**
 * Replace all instances of `From` with `To` in `Object`
 */
export type Replace<Object, From, To> =
  Object extends From
  ? To
  : Object extends Array<infer U>
  ? Array<Replace<U, From, To>>
  : IsPlainObject<Object> extends true
  ? { [ K in keyof Object ]: Replace<Object[ K ], From, To> }
  : Object;

/**
 * Generic shape of a React Router route's `Info` type
 */
export type RouteInfoType = {
  parents: any[];
  id: string;
  file: string;
  path: string;
  params: {
    [ key: string ]: string | undefined;
  };
  module: any;
  loaderData: any;
  actionData: any;
};
