import { Router } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import { applyGraphQL } from "https://deno.land/x/oak_graphql/mod.ts";

import { typeDefs } from "./schema/typeDefs.ts";
import { resolvers } from "./resolvers/index.ts";

export const GraphQLService = await applyGraphQL<Router>({
  Router,
  typeDefs,
  resolvers,
});
