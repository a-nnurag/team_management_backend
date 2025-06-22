import UserModel from "../models/user.model.js";
import { BadRequestException } from "../utils/ApiError.js";

export const getCurrentUserService = async (userId) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequest("User not found");
  }


  return user;
};
