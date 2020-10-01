import { applyGraphQL, gql } from "https://deno.land/x/oak_graphql/mod.ts";

// Graphql Type
export const typeDefs = (gql as any)`
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
