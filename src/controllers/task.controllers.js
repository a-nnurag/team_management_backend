import { getMemberRoleInWorkSpace } from "../services/member.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "../validation/task.validation.js";
import { projectSchema } from "../validation/project.validation.js";
import { workSpaceIdSchema } from "../validation/workspace.validation.js";
import { Permissions } from "../enums/role-enums.js";
import {
  createTaskService,
  updateTaskService,
  getAllTaskService,
  getTaskByIdService,
  deleteTaskByIdService,
} from "../services/task.service.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { roleGaurd } from "../utils/roleGuard.js";

export const createTaskController = asyncHandler(async (req, res) => {
  const body = createTaskSchema.parse(req.body);
  const projectId = projectSchema.parse(req.params.projectId);
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  console.log("body", body);

  const userId = req.user?._id;
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);

  roleGaurd(role, [Permissions.CREATE_TASK]);
  const task = await createTaskService(workspaceId, projectId, userId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Task created successfully",
    task,
  });
});

export const updateTaskController = asyncHandler(async (req, res) => {
  const body = updateTaskSchema.parse(req.body);
  const projectId = projectSchema.parse(req.params.projectId);
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const taskId = taskIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  // console.log(userId);
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  console.log("role", role);
  roleGaurd(role, [Permissions.EDIT_TASK]);
  const task = await updateTaskService(workspaceId, projectId, taskId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Task updated successfully",
    task,
  });
});

export const getAllTaskController = asyncHandler(async (req, res) => {
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const userId = req.user?._id;

  const filters = {
    projectId: req.query.projectId | undefined,
    status: req.query.status ? req.query.status?.split(",") : undefined,
    priority: req.query.priority ? req.query.priority?.split(",") : undefined,
    assignedTo: req.query.assignedTo
      ? req.query.assignedTo?.split(",")
      : undefined,
    keyword: req.query.keyword | undefined,
    dueDate: req.query.dueDate | undefined,
  };

  const pagination = {
    pageSize: parseInt(req.query.pageSize) || 10,
    pageNumber: parseInt(req.query.pageNumber) || 1,
  };

  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  roleGaurd(role, [Permissions.VIEW_ONLY]);

  const result = await getAllTaskService(workspaceId, filters, pagination);

  return res.status(HTTPSTATUS.OK).json({
    message: "All task fetched successfully",
    ...result,
  });
});

export const getTaskByIdController = asyncHandler(async (req, res) => {
  const projectId = projectSchema.parse(req.params.projectId);
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const taskId = taskIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  // console.log(userId);
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  // console.log("role", role);
  roleGaurd(role, [Permissions.VIEW_ONLY]);

  const task = await getTaskByIdService(workspaceId, projectId, taskId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Task fetched successfully",
    ...task,
  });
});

export const deleteTaskByIdController = asyncHandler(async (req, res) => {
  const workspaceId = workSpaceIdSchema.parse(req.params.workspaceId);
  const taskId = taskIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  // console.log(userId);
  const role = await getMemberRoleInWorkSpace(userId, workspaceId);
  // console.log("role", role);
  roleGaurd(role, [Permissions.DELETE_TASK]);

  await deleteTaskByIdService(workspaceId, taskId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Task deleted successfully",
  });
});
