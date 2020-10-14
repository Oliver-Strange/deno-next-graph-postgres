import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import { GraphQLService } from "./server.ts";
import { oakCors } from "./deps/cors.ts";

const { SERVER_PORT, TOKEN_NAME } = config();

const app = new Application();
// middleware to read cookies
app.use(async (ctx, next) => {
  const token = ctx.cookies.get(TOKEN_NAME);
  console.log("Token -->", token);

  await next();
});

app.use(oakCors({ credentials: true, origin: "http://localhost:8000" }));

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

await app.listen({ port: +SERVER_PORT });
