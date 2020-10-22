import { Application } from "./deps/oak.ts";
import { config } from "./deps/dotenv.ts";
import { oakCors } from "./deps/cors.ts";

import { GraphQLService } from "./server.ts";
import { checkToken } from "./middlewares/index.ts";

const { SERVER_PORT } = config();

const app = new Application();

app.use(oakCors({ credentials: true, origin: "http://localhost:8000" }));

app.use(checkToken);

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

await app.listen({ port: +SERVER_PORT });
