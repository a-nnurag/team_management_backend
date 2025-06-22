import { ErrorCodeEnum } from "../enums/error-code-enums.js";
import { Roles } from "../enums/role-enums.js";
import memberModel from "../models/member.model.js";
import workspaceModel from "../models/workspace.model.js";
import roleModel from "../models/role-permission.model.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/ApiError.js";


export const getMemberRoleInWorkSpace = async (userId, workSpaceId) => {
  const workSpace = await workspaceModel.findById(workSpaceId);

  if (!workSpace) {
    throw new NotFoundException("WorkSpace does not exist");
  }

  const member = await memberModel
    .findOne({ workSpaceId: workSpaceId, userId: userId })
    .populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }
  // console.log("member", member);
  const roleName = member.role?.name;
  // console.log("roleName", roleName);
  return roleName;
};

export const joinWorkSpaceByInviteService = async (userId, inviteCode) => {
  const workSpace = await workspaceModel.findOne({ inviteCode });

  if (!workSpace) {
    throw new NotFoundException(
      "invalid invite code or WorkSpace does not exist"
    );
  }

  const existingMember = await memberModel.findOne({
    userId,
    workSpaceId: workSpace._id,
  });

  // console.log("existingMember", existingMember);

  if (existingMember) {
    throw new BadRequestException("already a member of workspace");
  }

  const role = await roleModel.findOne({ name: Roles.MEMBER });

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // console.log("role", role);

  //add user to workspace as a member
  const newMember = new memberModel({
    userId,
    workSpaceId: workSpace._id,
    role: role._id,
  });

  // console.log("newMember", newMember);
  await newMember.save();

  return { workSpaceId: workSpace._id, role: role.name };
};
