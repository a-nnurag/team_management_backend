import mongoose, { Schema } from "mongoose";
import RolePermissions from "../utils/role-permission.js";

export const memberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    workSpaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const memberModel = mongoose.model("Member", memberSchema);

export default memberModel;
