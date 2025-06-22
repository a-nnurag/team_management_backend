import mongoose, { Schema } from "mongoose";
import { generateInviteCode } from "../utils/uuid.js";

export const workSpaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      //   max-limit:
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode,
    },
    createdAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

workSpaceSchema.methods.resetInviteCode = function () {
  this.inviteCode = generateInviteCode();
};
const workspaceModel = mongoose.model("Workspace", workSpaceSchema);

export default workspaceModel;
