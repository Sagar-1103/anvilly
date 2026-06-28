import { Router } from "express";
import { createProject, getProject, pingProject } from "../controllers/project.controller";

const projectRouter = Router();

projectRouter.post("/",createProject);
projectRouter.get("/:projectId",getProject);
projectRouter.get("/ping/:projectId",pingProject);


export default projectRouter;