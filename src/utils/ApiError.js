import { ErrorCodeEnum } from "../enums/error-code-enums.js";
import { HTTPSTATUS } from "../config/http.config.js";

//order of passing parameter should be same in extended classes also
// which are mentioned downwards
class ApiError extends Error {
  constructor(
    statusCode,
    errorCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class HttpException extends ApiError {
  constructor(message = "Http Exception Error", statusCode, errorCode) {
    super(statusCode, errorCode, message);
  }
}

export class InternalServerException extends ApiError {
  constructor(message = "Internal Server Error", errorCode) {
    super(
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      message
    );
  }
}

export class NotFoundException extends ApiError {
  constructor(message = "Resource not found", errorCode) {
    super(
      HTTPSTATUS.NOT_FOUND,
      errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND,
      message
    );
  }
}

export class BadRequestException extends ApiError {
  constructor(message = "Bad Request", errorCode) {
    super(
      HTTPSTATUS.BAD_REQUEST,
      errorCode || ErrorCodeEnum.VALIDATION_ERROR,
      message
    );
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message = "Unauthorized Access", errorCode) {
    super(
      HTTPSTATUS.UNAUTHORIZED,
      errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED,
      message
    );
  }
}

export { ApiError };
