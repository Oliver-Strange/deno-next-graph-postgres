import { RouterContext } from "../deps/oak.ts";

import { client } from "../db/db.ts";
import { queryUsersString } from "../utils/queryStrings.ts";
import {
  isAuthenticated,
  isSuperAdmin,
  checkAdmin,
} from "../utils/authUtil.ts";
import { UserResponse } from "../types/types.ts";

export const Query = {
  users: async (
    _: any,
    __: any,
    { request }: RouterContext
  ): Promise<UserResponse[] | null> => {
    try {
      // Authentication check
      const admin = await isAuthenticated(request);

      // Authorization check (admin and super admin users)
      const isSuper = isSuperAdmin(admin.roles);

      const isAdmin = checkAdmin(admin.roles);

      if (!isSuper && !isAdmin) throw new Error("No Authorization.");

      // Connect to the database
      await client.connect();

      const result = await client.query(queryUsersString());

      const users = result.rowsOfObjects();

      const returnedUsers: UserResponse[] = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
      }));

      return returnedUsers;
    } catch (error) {
      throw error;
    }
  },

  user: async (
    _: any,
    __: any,
    { request }: RouterContext
  ): Promise<UserResponse | null> => {
    try {
      const user = await isAuthenticated(request);

      const returnedUser: UserResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
      };

      return returnedUser;
    } catch (error) {
      return null;
    }
  },
};
