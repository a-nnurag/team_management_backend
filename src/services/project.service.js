import mongoose from "mongoose";
import { HTTPSTATUS } from "../config/http.config.js";
import projectModel from "../models/project.models.js";
import taskModel from "../models/task.model.js";
import { NotFoundException } from "../utils/ApiError.js";
import { TaskStatusEnum } from "../enums/task-enums.js";

export const createProjectService = async (workspaceId, userId, body) => {
  const project = new projectModel({
    ...(body.emoji && { emoji: body.emoji }), //as emoji is optional
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  return project;
};

export const getProjectInWorkSpaceService = async (
  workspaceId,
  pageSize,
  pageNumber
) => {
  //find all projects in workspace
  const totalCount = await projectModel.countDocuments({
    workspace: workspaceId,
  });

  //pagination of data to improve efficiency imp concept
  const skip = (pageNumber - 1) * pageSize;

  const projects = await projectModel
    .find({
      workspace: workspaceId,
    })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};

export const getProjectByIdAndWorkSpaceIdService = async (
  workspaceId,
  projectId
) => {
  const project = await projectModel
    .findOne({
      _id: projectId,
      workspace: workspaceId,
    })
    .select("_id emoji name description");

  if (!project) {
    throw new NotFoundException(
      "Project Not Found or does not belong to the specified workspace "
    );
  }

  return project;
};

export const getProjectAnalyticsService = async (projectId, workspaceId) => {
  const project = await projectModel.findById({
    _id: projectId,
  });

  if (!project || project.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found does not belong to the workspace"
    );
  }

  const currentDate = new Date();

  //using aggregation pipeline
  const taskAnalytics = await taskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [
          {
            $count: "count",
          },
        ],
        overDueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: { status: TaskStatusEnum.DONE },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overDueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return analytics;
};

export const updateProjectService = async (workspaceId, projectId, body) => {
  const { name, emoji, description } = body;

  const project = await projectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project Not Found or does not belong to the specified workspace "
    );
  }

  if (emoji) {
    project.emoji = emoji;
  }

  if (name) {
    project.name = name;
  }

  if (description) {
    project.description = description;
  }

  await project.save();

  return project;
};

export const deleteProjectService = async (workspaceId, projectId) => {
  const project = await projectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project Not Found or does not belong to the specified workspace "
    );
  }

  await project.deleteOne();

  await taskModel.deleteMany({
    project: projectId,
  });

  return project;
};
