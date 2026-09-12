import { Router } from "express";
import { answerQuestion, createProject, deleteProject, getProject, getProjects, pingProject, updateProject } from "../controllers/project.controller";
import { getFileTree, readFileContent } from "../controllers/file.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post("/",createProject);
projectRouter.get("/",getProjects);
projectRouter.post("/answer", answerQuestion);
projectRouter.get("/:projectId/files", getFileTree);
projectRouter.get("/:projectId/files/read", readFileContent);
projectRouter.get("/:projectId",getProject);
projectRouter.post("/:projectId",updateProject);
projectRouter.delete("/:projectId",deleteProject);
projectRouter.get("/ping/:projectId",pingProject);


export default projectRouter