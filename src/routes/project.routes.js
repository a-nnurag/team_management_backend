import { Router } from "express";
import {
  createProjectController,
  getAllProjectinWorkSpaceController,
  getProjectByIdAndWorkSpaceId,
  getProjectAnalyticsController,
  updateProjectController,
  deleteProjectController
} from "../controllers/project.controller.js";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", createProjectController);
projectRoutes.get(
  "/workspace/:workspaceId/all",
  getAllProjectinWorkSpaceController
);
projectRoutes.get("/:id/workspace/:workspaceId", getProjectByIdAndWorkSpaceId);
//cross test if tisworking properly
projectRoutes.get("/:id/workspace/:workspaceId/analytics", getProjectAnalyticsController);
projectRoutes.put("/:id/workspace/:workspaceId/update", updateProjectController);
projectRoutes.delete("/:id/workspace/:workspaceId/delete", deleteProjectController);


export default projectRoutes;
