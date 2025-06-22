import asyncHandler from "../utils/asyncHandler.js";
import {
  changeRoleSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workSpaceIdSchema,
} from "../validation/workspace.validation.js";
import {
  createWorkSpaceService,
  getAllWorkSpaceUserIsMemberService,
  getWorkSpaceByIdService,
  getWorkSpaceAnalyticsService,
  changeMemberRoleService,
  deleteWorkSpaceService,
  updateWorkspaceByIdService,
} from "../services/workspace.service.js";
import { HTTPSTATUS } from "../config/http.config.js";
import UserModel from "../models/user.model.js";
import { getMemberRoleInWorkSpace } from "../services/member.service.js";
import memberModel from "../models/member.model.js";
import { Permissions } from "../enums/role-enums.js";
import { roleGaurd } from "../utils/roleGuard.js";
import { getWorkSpaceMembersService } from "../services/workspace.service.js";

export const createWorkSpaceController = asyncHandler(async (req, res) => {
  const body = createWorkspaceSchema.parse(req.body);
  const userId = req.user?._id;
  const workSpace = await createWorkSpaceService(userId, body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Workspace created successfully",
    workSpace,
  });
});

export const getAllWorkSpaceUserIsMemberController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;

    const workSpaces = await getAllWorkSpaceUserIsMemberService(userId);
    // console.log("workSpaces", workSpaces);

    return res.status(HTTPSTATUS.OK).json({
      message: "User workspaces fetched successfully",
      workSpaces,
    });
  }
);

export const getWorkSpaceByIdController = asyncHandler(async (req, res) => {
  const workSpaceId = workSpaceIdSchema.parse(req.params.id);
  const userId = req?.user?._id;

  await getMemberRoleInWorkSpace(userId, workSpaceId);

  const workSpace = await getWorkSpaceByIdService(workSpaceId);

  return res.status(HTTPSTATUS.OK).json({
    message: "workspace fetched successfully",
    workSpace,
  });
});

export const getWorkSpaceMembersController = asyncHandler(async (req, res) => {
  const workSpaceId = workSpaceIdSchema.parse(req.params.id);
  const userId = req?.user?._id;

  const role = await getMemberRoleInWorkSpace(userId, workSpaceId);
  // Without roleGuard: Anyone who is a member can see all members
  // With roleGuard: Only users with proper permissions can see members
  //  Granular Permissions
  // OWNER: Can do everything
  // ADMIN: Can manage members, projects
  // MEMBER: Can view and edit assigned tasks
  // VIEWER: Can only view certain information
  roleGaurd(role, [Permissions.VIEW_ONLY]);

  const { members, roles } = await getWorkSpaceMembersService(workSpaceId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace members retrieved successfully",
    members,
    roles,
  });
});

export const getWorkSpaceAnalyticsController = asyncHandler(
  async (req, res) => {
    const workSpaceId = workSpaceIdSchema.parse(req.params.id);
    const userId = req?.user?._id;

    const role = await getMemberRoleInWorkSpace(userId, workSpaceId);
    //roleGaurd(role, [Permissions.VIEW_ONLY]);

    const analytics = await getWorkSpaceAnalyticsService(workSpaceId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace analytics retrieved successfully",
      analytics,
    });
  }
);

export const changeWorkSpaceMemberController = asyncHandler(
  async (req, res) => {
    const workSpaceId = workSpaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);

    const userId = req?.user?._id;

    const role = await getMemberRoleInWorkSpace(userId, workSpaceId);
    roleGaurd(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const member = await changeMemberRoleService(workSpaceId, memberId, roleId);
    // console.log("member", member);

    return res.status(HTTPSTATUS.OK).json({
      message: "Member role changed successfully",
      member,
    });
  }
);

export const updateWorkSpaceByIdController = asyncHandler(async (req, res) => {
  const { name, description } = updateWorkspaceSchema.parse(req.body);
  const workSpaceId = workSpaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  const role = await getMemberRoleInWorkSpace(userId, workSpaceId);
  roleGaurd(role, [Permissions.EDIT_WORKSPACE]);
  const { workspace } = await updateWorkspaceByIdService(
    workSpaceId,
    name,
    description
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace updated successfully",
  });
});

export const deleteWorkSpaceByIdController = asyncHandler(async (req, res) => {
  const workSpaceId = workSpaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  // console.log("Received deletion request");

  const role = await getMemberRoleInWorkSpace(userId, workSpaceId);
  roleGaurd(role, [Permissions.DELETE_WORKSPACE]);

  const { currentWorkspace } = await deleteWorkSpaceService(
    workSpaceId,
    userId
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace deleted successfully",
    currentWorkspace,
  });
});
