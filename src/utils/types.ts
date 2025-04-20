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
