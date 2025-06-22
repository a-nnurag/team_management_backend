import { ZodError } from "zod";
import { HTTPSTATUS } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code-enums.js";
import { ApiError } from "../utils/ApiError.js";

///error regarding data input zod validation
const formatZodError = (res, error) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

//error for n/w errors
export const errorHandler = (error, req, res, next) => {
  console.error(`Error occured on path: ${req.path}`, error);

  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      messageP: "Invalid json format ,Please check your request",
    });
  }

  if (error instanceof ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    error: error?.message || "Unknown error occurred",
  });
};
