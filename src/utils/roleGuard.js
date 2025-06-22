import { UnauthorizedException } from "./ApiError.js";
import RolePermissions from "./role-permission.js";
import { Permissions } from "../enums/role-enums.js";

export const roleGaurd = (role, requiredPermissions) => {
  const permissions = RolePermissions[role];

  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermissions) {
    throw new UnauthorizedException(
      "You do not have the necessary permission to perform the action"
    );
  }
};
