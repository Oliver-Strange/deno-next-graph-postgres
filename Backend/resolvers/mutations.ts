import { RouterContext } from "../deps/oak.ts";
import bcrypt from "../deps/bcrypt.ts";

import type { SignupArgs, UserResponse, User } from "../types/types.ts";

import {
  validateUsername,
  validatePassword,
  validateEmail,
} from "./../utils/validations.ts";

import { client } from "./../db/db.ts";

import { queryByEmailString, insertUserString } from "../utils/queryStrings.ts";
import { createToken, sendToken } from "./../utils/tokenHandler.ts";
import { SigninArgs } from "../types/types.ts";

export const Mutation = {
  // async for db connection, promise the UserResponse type or null
  signup: async (
    _: any,
    { username, email, password }: SignupArgs,
    { cookies }: RouterContext
  ): Promise<UserResponse | null> => {
    try {
      // check for arguments object from the front end
      if (!username) throw new Error("Username is required");
      if (!email) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");

      // validate username
      const formattedUsername = username.trim();
      const isUsernameValid = validateUsername(formattedUsername);

      if (!isUsernameValid)
        throw new Error("Username must be 3 to 30 characters");

      // validate password
      const isPasswordValid = validatePassword(password);
      if (!isPasswordValid)
        throw new Error("Password must be at least 6 characters long");

      // validate email
      const formattedEmail = email.trim().toLowerCase();
      const isEmailValid = validateEmail(formattedEmail);
      if (!isEmailValid) throw new Error("Must have valid email address");

      // connect to the db to check if email or user exists
      await client.connect();
      const result = await client.query(queryByEmailString(formattedEmail));
      const user = result.rowsOfObjects()[0] as User;

      if (user) throw new Error("Email in use");

      // if we get this far, hash the password and save the user to the database
      const hashedPassword = await bcrypt.hash(password);

      const userData = await client.query(
        insertUserString(formattedUsername, formattedEmail, hashedPassword)
      );

      const newUser = userData.rowsOfObjects()[0] as User;

      const returnedUser: UserResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
        created_at: newUser.created_at,
      };
      // finished working with db, so close connection
      await client.end();

      // Create a jwt and send to the front end so new users are automatically signed in
      const token = await createToken(newUser.id, newUser.tokenVersion);

      // send jwt to the front end
      sendToken(cookies, token);

      return returnedUser;
    } catch (error) {
      throw error;
    }
  },

  signin: async (
    _: any,
    { email, password }: SigninArgs,
    { cookies }: RouterContext
  ): Promise<UserResponse | null> => {
    try {
      // check for arguments object from the front end
      if (!email) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");

      // validate email
      const formattedEmail = email.trim().toLowerCase();

      // connect to the db to check if email or user exists
      await client.connect();
      const result = await client.query(queryByEmailString(formattedEmail));
      const user = result.rowsOfObjects()[0] as User;

      if (!user) throw new Error("Email or password is invalid");

      // Validate the password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) throw new Error("Email or password is invalid");

      const returnedUser: UserResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
      };
      // finished working with db, so close connection
      await client.end();

      // Create a jwt and send to the front end so new users are automatically signed in
      const token = await createToken(user.id, user.tokenVersion);

      // send jwt to the front end
      sendToken(cookies, token);

      return returnedUser;
    } catch (error) {
      throw error;
    }
  },
};
