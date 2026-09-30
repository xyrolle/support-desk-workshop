import type { RequestContext } from "../request-context.ts";

/** Values every request handler can read from `c.var`. */
export type AppEnv = {
  Variables: {
    context: RequestContext;
  };
};
