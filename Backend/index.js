import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { GraphQLService } from "./server.ts";

const { SERVER_PORT } = config();

const app = new Application();

// // Logger
// app.use(async (ctx, next) => {
//   await next();
//   const rt = ctx.response.headers.get("X-Response-Time");
//   console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
// });

// // Timing
// app.use(async (ctx, next) => {
//   const start = Date.now();
//   await next();
//   const ms = Date.now() - start;
//   ctx.response.headers.set("X-Response-Time", `${ms}ms`);
// });

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

await app.listen({ port: +SERVER_PORT });
