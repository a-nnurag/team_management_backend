import { Roles } from "../enums/role-enums.js";
import memberModel from "../models/member.model.js";
import roleModel from "../models/role-permission.model.js";
import UserModel from "../models/user.model.js";
import workspaceModel from "../models/workspace.model.js";
import taskModel from "../models/task.model.js";
import projectModel from "../models/project.models.js";
import { TaskStatusEnum } from "../enums/task-enums.js";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
} from "../utils/ApiError.js";
import mongoose from "mongoose";

export const createWorkSpaceService = async (userId, body) => {
  const { name, description } = body;

  console.log("description", body);

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await roleModel.findOne({ name: Roles.OWNER });

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new workspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });

  await workspace.save();

  const member = new memberModel({
    userId: user._id,
    workSpaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkspace = workspace._id;

  await user.save();

  return workspace;
};

//get all workspaces to which user is a member
export const getAllWorkSpaceUserIsMemberService = async (userId) => {
  const memberships = await memberModel
    .find({ userId })
    .populate("workSpaceId")
    .select("-password")
    .exec();

  // Extract workspace details from memberships
  const workspaces = memberships.map((membership) => membership.workSpaceId);

  return workspaces;
};

export const getWorkSpaceByIdService = async (workSpaceId) => {
  const workSpace = await workspaceModel.findById(workSpaceId);
  if (!workSpace) {
    throw new NotFoundException("WorkSpace does not exist");
  }

  const members = await memberModel.find({ workSpaceId }).populate("role");

  const workspaceWithMembers = {
    ...workSpace.toObject(),
    members,
  };

  return workspaceWithMembers;
};

export const getWorkSpaceMembersService = async (workSpaceId) => {
  const members = await memberModel
    .find({ workSpaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  //     roleModel.find({}, { name: 1, _id: 1 })
  // {} - Empty filter, so it finds ALL role documents
  // { name: 1, _id: 1 } - Projection: Only include name and _id fields in the results
  // 1 means "include this field", 0 means "exclude this field"

  const roles = await roleModel
    .find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();

  return { members, roles };
};

export const getWorkSpaceAnalyticsService = async (workSpaceId) => {
  const currentDate = new Date();

  const totalTasks = await taskModel.countDocuments({
    workspace: workSpaceId,
  });

  const overdueTasks = await taskModel.countDocuments({
    workspace: workSpaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await taskModel.countDocuments({
    workspace: workSpaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };

  return analytics;
};

export const changeMemberRoleService = async (
  workSpaceId,
  memberUserId,
  roleId
) => {
  const workSpace = await workspaceModel.findById(workSpaceId);
  if (!workSpace) {
    throw new NotFoundException("WorkSpace does not exist");
  }

  const role = await roleModel.findById(roleId);

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await memberModel.findOne({
    workSpaceId: workSpaceId,
    userId: memberUserId,
  });

  if (!member) {
    throw new NotFoundException("Member not found in the workspace");
  }

  member.role = role;
  await member.save();

  return member;
};

export const updateWorkspaceByIdService = async (
  workSpaceId,
  name,
  description
) => {
  const workSpace = await workspaceModel.findById(workSpaceId);
  if (!workSpace) {
    throw new NotFoundException("WorkSpace does not exist");
  }

  workSpace.name = name || workSpace.name;
  workSpace.description = description || workSpace.description;

  await workSpace.save();

  return workSpace;
};

export const deleteWorkSpaceService = async (workSpaceId, userId) => {
  //here using transactions bcz of multiple actions
  const session = await mongoose.startSession();
  session.startTransaction();

  console.log("reached suring deletiton");

  try {
    const workspace = await workspaceModel
      .findById(workSpaceId)
      .session(session);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    if (workspace.owner.toString() !== userId) {
      throw new BadRequestException(
        "You are not authorised to delete this workspace"
      );
    }

    const user = await UserModel.findById(userId).session(session);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await projectModel
      .deleteMany({ workspace: workspace._id })
      .session(session);

    await taskModel.deleteMany({ workspace: workspace._id }).session(session);

    await memberModel
      .deleteMany({
        workSpaceId: workspace._id,
      })
      .session(session);

    if (user?.currentWorkspace?.equals(workSpaceId)) {
      const memberWorkSpace = await memberModel
        .findOne({ userId: userId })
        .session(session);

      //update the current user workspace
      user.currentWorkspace = memberWorkSpace
        ? memberWorkSpace.workSpaceId
        : null;

      await user.save({ session });
    }

    await workspace.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      currentWorkspace: user.currentWorkspace,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new InternalServerException(
      "Something happend during deletion of workspacee",
      err
    );
  }
};
