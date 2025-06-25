import { UnauthorizedException } from "../utils/ApiError.js";

const isAuthenticated = (req, res, next) => {
  console.log("isAuthenticated middleware called", req.user);
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized please login");
  }
  next();
};

export default isAuthenticated;
