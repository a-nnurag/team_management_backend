import { UnauthorizedException } from "../utils/ApiError.js";

const isAuthenticated = (req, res, next) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized please login");
  }
  next();
};

export default isAuthenticated;
