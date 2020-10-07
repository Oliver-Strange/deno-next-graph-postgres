import { config } from "https://deno.land/x/dotenv/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt@v1.7/validate.ts";
import {
  makeJwt,
  setExpiration,
  Jose,
  Payload,
} from "https://deno.land/x/djwt@v1.7/create.ts";
import type { Cookies } from "https://deno.land/x/oak/mod.ts";

const { TOKEN_KEY, TOKEN_NAME } = config();

const header: Jose = {
  alg: "HS256",
  typ: "JWT",
};

// token expires in 15 days
const tokenExpiration = Date.now() + 1000 * 60 * 60 * 24 * 15;

export const createToken = (id: string, token_version: number) => {
  const payloadInfo: { id: string; token_version: number } = {
    id,
    token_version,
  };

  const payload: Payload = {
    payloadInfo,
    exp: setExpiration(tokenExpiration),
  };

  return makeJwt({ header, key: TOKEN_KEY, payload });
};

export const sendToken = (cookies: Cookies, token: string) => {
  cookies.set(TOKEN_NAME, token, { httpOnly: true });
};