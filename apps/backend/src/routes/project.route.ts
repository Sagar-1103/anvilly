import { Router } from "express";
import { createProject, getProject, pingProject, updateProject } from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post("/",createProject);
projectRouter.get("/:projectId",getProject);
projectRouter.post("/:projectId",updateProject);
projectRouter.get("/ping/:projectId",pingProject);


export default projectRouter