import Router from "express";
const taskRoutes = Router();

import {
  createTaskController,
  updateTaskController,
  getAllTaskController,
  getTaskByIdController,
  deleteTaskByIdController
} from "../controllers/task.controllers.js";

taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/create",
  createTaskController
);

taskRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  updateTaskController
);

taskRoutes.get("/workspace/:workspaceId/all", getAllTaskController);

taskRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  getTaskByIdController
);

taskRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteTaskByIdController
);
export default taskRoutes;
