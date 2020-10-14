import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import { GraphQLService } from "./server.ts";
import { oakCors } from "./deps/cors.ts";

const { SERVER_PORT } = config();

const app = new Application();

app.use(oakCors({ credentials: true, origin: "http://localhost:8000" }));

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

await app.listen({ port: +SERVER_PORT });
