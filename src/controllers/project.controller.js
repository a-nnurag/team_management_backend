import asyncHandler from "../utils/asyncHandler.js";
import {
  createProjectSchema,
  projectSchema,
  updateProjectSchema,
} from "../validation/project.validation.js";
import { workSpaceIdSchema } from "../validation/workspace.validation.js";
import { getMemberRoleInWorkSpace } from "../services/member.service.js";
import { Permissions } from "../enums/role-enums.js";
import {
  createProjectService,
  getProjectInWorkSpaceService,
  getProjectByIdAndWorkSpaceIdService,
  getProjectAnalyticsService,
  updateProjectService,
  deleteProjectService,
} from "../services/project.service.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { roleGaurd } from "../utils/roleGuard.js";
import projectModel from "../models/project.models.js";

export const createProjectController = asyncHandler(async (req, res) => {
  const body = createProjectSchema.parse(req.body);
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const userId = req.user?._id;

  //checking allowed or not
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  console.log("role", role);
  roleGaurd(role, [Permissions.CREATE_PROJECT]);

  const project = await createProjectService(workspaceId, userId, body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Project created successfully",
    project,
  });
});

export const getAllProjectinWorkSpaceController = asyncHandler(
  async (req, res) => {
    const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    //checking allowed or not
    const role = await getMemberRoleInWorkSpace(userId, workspaceId);
    console.log("role", role);
    roleGaurd(role, [Permissions.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 1;

    const { projects, totalCount, totalPages, skip } =
      await getProjectInWorkSpaceService(workspaceId, pageSize, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project fetched successfully",
      projects,
      pageSize,
      pageNumber,
      totalPages,
      skip,
      limit: pageSize,
    });
  }
);

export const getProjectByIdAndWorkSpaceId = asyncHandler(async (req, res) => {
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const userId = req.user?._id;
  const projectId = projectSchema.parse(req.params.id);

  //checking allowed or not
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  console.log("role", role);
  roleGaurd(role, [Permissions.VIEW_ONLY]);

  const project = await getProjectByIdAndWorkSpaceIdService(
    workspaceId,
    projectId
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Project fetched successfully",
    project,
  });
});

export const getProjectAnalyticsController = asyncHandler(async (req, res) => {
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const userId = req.user?._id;
  const projectId = projectSchema.parse(req.params.id);

  //checking allowed or not
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  //   console.log("role", role);
  roleGaurd(role, [Permissions.VIEW_ONLY]);

  const analytics = await getProjectAnalyticsService(projectId, workspaceId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Project analytics fetched successfully",
    analytics,
  });
});

export const updateProjectController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const projectId = projectSchema.parse(req.params.id);
  const body = updateProjectSchema.parse(req.body);
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);

  //checking allowed or not
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  //   console.log("role", role);
  roleGaurd(role, [Permissions.EDIT_PROJECT]);

  const project = await updateProjectService(workspaceId, projectId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Project updated successfully",
    project,
  });
});

export const deleteProjectController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const projectId = projectSchema.parse(req.params.id);
//   console.log("projectId");
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
//   console.log("workspaceId");

  //checking allowed or not
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  //   console.log("role", role);
  roleGaurd(role, [Permissions.DELETE_PROJECT]);

  await deleteProjectService(workspaceId, projectId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Project deleted successfully",
  });
});
