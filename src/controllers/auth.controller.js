import asyncHandler from "../utils/asyncHandler.js";
import config from "../config/app.config.js";
import { registerSchema } from "../validation/auth.validation.js";
import { registerUserService } from "../services/auth.service.js";
import { HTTPSTATUS } from "../config/http.config.js";
import passport from "passport"; // Missing import

export const googleLoginCallback = asyncHandler(async (req, res) => {
  const currentWorkspace = req.user?.currentWorkspace;

  if (!currentWorkspace) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
    );
  }

  return res.redirect(
    `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
  );
});

export const registerUserController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse({
    ...req.body,
  });

  await registerUserService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User created successfully",
  });
});

//why not working when wrapped around asynHandler
// On subsequent requests:
// 1. Browser sends session cookie
// 2. Session middleware reads cookie, retrieves session data
// 3. Passport calls deserializeUser to populate req.user
// 4. Your route handlers can access req.user
// Passport calls serializeUser to decide what to store in session
// Session middleware creates/updates the session cookie
// Cookie is sent to browser with session ID
export const loginController = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    // console.log("User", user);

    if (!user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: info?.message || "Invalid email or password",
      });
    }

    // req.logIn is a Passport.js method that establishes a login session for a user.
    // Creates a session for the authenticated user
    // Calls serialize function to store user data in session
    // Sets up req.user so you can access user info on future requests
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res
        .status(HTTPSTATUS.OK)
        .json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
};

export const logOutController = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        error: "Failed to logout",
      });
    }

    // Only nullify session AFTER logout is complete
    req.session = null;
    return res.status(HTTPSTATUS.OK).json({
      message: "Logged out successfully",
    });
  });
});
