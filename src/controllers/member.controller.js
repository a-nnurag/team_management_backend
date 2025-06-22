import { HTTPSTATUS } from "../config/http.config.js";
import asyncHandler from "../utils/asyncHandler.js";
import {inviteCodeSchema} from "../validation/member.validation.js";
import {joinWorkSpaceByInviteService} from "../services/member.service.js";

export const joinWorkSpaceController = asyncHandler(async (req, res) => {
  const inviteCode = inviteCodeSchema.parse(req.params.inviteCode);
  const userId = req.user?._id;

  const { workSpaceId, role } = await joinWorkSpaceByInviteService(
    userId,
    inviteCode
  );

  return res.status(HTTPSTATUS.OK).json({
    workSpaceId,
    role,
  });
});
