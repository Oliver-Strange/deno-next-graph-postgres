import { Router } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import { applyGraphQL, gql } from "https://deno.land/x/oak_graphql/mod.ts";

// Graphql Type
const typeDefs = (gql as any)`
    type User {
        username: String!,
        email: String!,
        password: String!
    }

    type Query {
        users: [User]!
    }

    type Mutation {
        signup(username: String!, email: String!, password: String!): User
    }
`;
const users = [
  { username: "preston", email: "test@test.com", password: "1234" },
];

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    signup: (
      parent: any,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string },
      ctx: any,
      info: any
    ) => {
      const newUser = { username, email, password };

      users.push(newUser);

      return newUser;
    },
  },
};

export const GraphQLService = await applyGraphQL<Router>({
  Router,
  typeDefs,
  resolvers,
});
