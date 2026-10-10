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
import {
  triggerProjectBuild,
  getProjectBuilds,
  cancelProjectBuild,
} from "../controllers/build.controller";
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

projectRouter.post("/:projectId/build", requireAuth(triggerProjectBuild));
projectRouter.get("/:projectId/builds", requireAuth(getProjectBuilds));
projectRouter.post("/:projectId/builds/:buildId/cancel", requireAuth(cancelProjectBuild));

export default projectRouter;