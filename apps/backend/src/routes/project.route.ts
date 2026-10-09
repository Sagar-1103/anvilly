import { Router } from "../lib/router";
import {
  answerQuestion,
  createProject,
  deleteProject,
  getProject,
  getProjects,
  pingProject,
  updateProject,
  updateProjectMetadata,
} from "../controllers/project.controller";
import { getFileTree, readFileContent } from "../controllers/file.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const projectRouter = new Router();

projectRouter.post("/", requireAuth(createProject));
projectRouter.get("/", requireAuth(getProjects));
projectRouter.post("/answer", requireAuth(answerQuestion));
projectRouter.get("/:projectId/files", requireAuth(getFileTree));
projectRouter.get("/:projectId/files/read", requireAuth(readFileContent));
projectRouter.get("/:projectId", requireAuth(getProject));
projectRouter.post("/:projectId", requireAuth(updateProject));
projectRouter.patch("/:projectId", requireAuth(updateProjectMetadata));
projectRouter.delete("/:projectId", requireAuth(deleteProject));
projectRouter.get("/ping/:projectId", requireAuth(pingProject));

export default projectRouter;