import { v4 as uuid } from "uuid";

// uuid() - Generates a random UUID like "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
// .replace(/-/g, "") - Removes ALL hyphens (-) from the UUID
// /-/g is a regex: / starts pattern, - matches hyphen, /g means "global" (all occurrences)
// .substring(0, 8) - Takes the first 8 characters only

export function generateInviteCode() {
  return uuid().replace(/-/g, "").substring(0, 8);
}

export function generateTaskCode() {
  return `task-${uuid().replace(/-/g, "").substring(0, 8)}`;
}
