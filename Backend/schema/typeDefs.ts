import { gql } from "https://deno.land/x/oak_graphql/mod.ts";

// Graphql Type
export const typeDefs = gql`
  enum RoleOptions {
    CLIENT
    ITEMEDITOR
    ADMIN
    SUPERADMIN
  }

  type User {
    id: String!
    username: String!
    email: String!
    roles: [RoleOptions!]!
    created_at: String!
  }

  type Query {
    users: [User]!
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): User

    signin(email: String!, password: String!): User
  }
`;
