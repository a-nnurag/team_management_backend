import { Router } from "express";
import {
  createWorkSpaceController,
  getWorkSpaceByIdController,
  getAllWorkSpaceUserIsMemberController,
  getWorkSpaceMembersController,
  getWorkSpaceAnalyticsController,
  changeWorkSpaceMemberController,
  updateWorkSpaceByIdController,
  deleteWorkSpaceByIdController
} from "../controllers/workspace.controller.js";

const workSpaceRoutes = Router();

workSpaceRoutes.post("/create/new", createWorkSpaceController);
workSpaceRoutes.get("/all", getAllWorkSpaceUserIsMemberController);
workSpaceRoutes.get("/:id", getWorkSpaceByIdController);
workSpaceRoutes.get("/members/:id", getWorkSpaceMembersController);
workSpaceRoutes.get("/analytics/:id", getWorkSpaceAnalyticsController);
workSpaceRoutes.put("/change/member/role/:id", changeWorkSpaceMemberController);
workSpaceRoutes.put("/update/:id", updateWorkSpaceByIdController);
workSpaceRoutes.delete("/delete/:id", deleteWorkSpaceByIdController);

//owner has only permission to change workspace members

export default workSpaceRoutes;
