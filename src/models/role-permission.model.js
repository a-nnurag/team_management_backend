import mongoose, { Schema } from "mongoose";
import { Roles, Permissions } from "../enums/role-enums.js";
import RolePermissions from "../utils/role-permission.js";

export const roleSchema = new Schema(
  {
    name: {
      type: String,
      enum: Object.values(Roles),
      required: true,
      unique: true,
    },
    permission: {
      type: [String],
      enum: Object.values(Permissions),
      required: true,
      default: function () {
        return RolePermissions[this.name];
      },
    },
  },
  {
    timestamps: true,
  }
);

const roleModel = mongoose.model("Role", roleSchema);

export default roleModel;
