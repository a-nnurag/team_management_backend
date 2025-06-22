import { HTTPSTATUS } from "../config/http.config.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getCurrentUserService } from "../services/user.service.js";

export const getCurrentUserController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const  user  = await getCurrentUserService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "User fetched successfully ",
    user,
  });
});
