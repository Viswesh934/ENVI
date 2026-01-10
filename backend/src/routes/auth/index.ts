import loginRoute from "./login";
import registerRoute from "./register";
import { FastifyInstance } from "fastify";

export default async function authRoutes(app: FastifyInstance) {
  app.register(registerRoute);
  app.register(loginRoute);
}