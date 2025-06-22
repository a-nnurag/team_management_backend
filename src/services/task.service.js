import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task-enums.js";
import memberModel from "../models/member.model.js";
import projectModel from "../models/project.models.js";
import taskModel from "../models/task.model.js";
import { BadRequestException, NotFoundException } from "../utils/ApiError.js";

export const createTaskService = async (
  workspaceId,
  projectId,
  userId,
  body
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;
  const project = await projectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or not belong to this workspace"
    );
  }

  if (assignedTo) {
    const isAssignedUserMember = await memberModel.exists({
      userId: assignedTo,
      workSpaceId: workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned member is not a member of this workspace");
    }
  }

  const task = new taskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  return task;
};

export const updateTaskService = async (
  workspaceId,
  projectId,
  taskId,
  body
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;
  const project = await projectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or not belong to this workspace"
    );
  }

  if (assignedTo) {
    const isAssignedUserMember = await memberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned member is not a member of this workspace");
    }
  }

  const task = await taskModel.findById(taskId);
  if (!task || task.project.toString() !== projectId) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  const updatedTask = await taskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    {
      new: true,
    }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return updatedTask;
};

export const getAllTaskService = async (workspaceId, filters, pagination) => {
  const query = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    taskModel
      .find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    taskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (workspaceId, projectId, taskId) => {
  const project = await projectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or not belong to this workspace"
    );
  }

  const task = await taskModel
    .findOne({ _id: taskId, project: projectId, workspace: workspaceId })
    .populate("assignedTo", "_id name profilePicture -password");
  if (!task || task.project.toString() !== projectId) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  return task;
};

export const deleteTaskByIdService = async (workspaceId, taskId) => {
  const task = await taskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException("Task not found ");
  }

  return;
};
