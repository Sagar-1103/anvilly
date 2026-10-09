import { Router } from "../lib/router";
import projectRouter from "./project.route";

const appRouter = new Router();

appRouter.get("/health", () => {
  return Response.json({ success: true });
});

appRouter.use("/projects", projectRouter);

export default appRouter;