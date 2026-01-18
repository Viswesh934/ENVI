import loginRoute from "./login";
import registerRoute from "./register";
import logoutRoute from "./logout";
import { FastifyInstance } from "fastify";

export default async function authRoutes(app: FastifyInstance) {
  app.register(registerRoute);
  app.register(loginRoute);
  app.register(logoutRoute);
}