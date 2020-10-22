import { Middleware } from "../deps/oak.ts";
import { config } from "../deps/dotenv.ts";
import { PayloadObject } from "../deps/djwt.ts";

import { verifyToken, createToken, sendToken } from "../utils/tokenHandler.ts";
import { User, PayloadInfo } from "../types/types.ts";
import { isAuthenticated } from "../utils/authUtil.ts";
import { client } from "../db/db.ts";
import { updateTokenVersionString } from "../utils/queryStrings.ts";

const { TOKEN_NAME } = config();

export const checkToken: Middleware = async (ctx, next) => {
  let token: string | undefined;
  const authorization = ctx.request.headers.get("authorization");

  if (authorization) {
    token = authorization.split(" ")[1];
  } else {
    token = ctx.cookies.get(TOKEN_NAME);
  }

  if (token) {
    // Decode the token
    const decodedToken = await verifyToken(token);

    // If decodedToken.isValid is true it means the token is valid
    if (decodedToken.isValid) {
      if (decodedToken.payload) {
        const payload = decodedToken.payload as PayloadObject & {
          payloadInfo: PayloadInfo;
        };

        const { payloadInfo, exp } = payload;

        ctx.request.userId = payloadInfo?.id;
        ctx.request.tokenVersion = payloadInfo?.tokenVersion;
        ctx.request.exp = exp;

        // Calculate how long the current token has been created
        const currentTokenAge = Date.now() + 1000 * 60 * 60 * 24 * 15 - exp!;

        // Check if the current token age is greater than 6 hours
        if (currentTokenAge > 1000 * 60 * 60 * 6) {
          try {
            const user = await isAuthenticated(ctx.request);

            if (user) {
              // 1. Invalidate the current token --> updating the token version on the user in the database
              await client.connect();

              const updatedUserData = await client.query(
                updateTokenVersionString(user.id, user.tokenVersion + 1)
              );

              const updatedUser = updatedUserData.rowsOfObjects()[0] as User;

              if (updatedUser) {
                // 2. Create the new token
                const newToken = await createToken(
                  updatedUser.id,
                  updatedUser.tokenVersion
                );

                // Send the new token to the frontend
                sendToken(ctx.cookies, newToken);

                // Reattach the new token version onto the request object
                ctx.request.tokenVersion = updatedUser.tokenVersion;
                ctx.request.exp = Date.now() + 1000 * 60 * 60 * 24 * 15;
              }
            }
          } catch (error) {}
        }
      }
    }
  }

  await next();
};
