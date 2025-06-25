import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import config from "./app.config.js";
import { NotFoundException } from "../utils/ApiError.js";
import ProviderEnum from "../enums/account-provider-enums.js";
import {
  loginOrCreateAccountService,
  verifyUserService,
} from "../services/auth.service.js";

//The done() function is a callback function provided by Passport.js that you
// must call to signal the completion of authentication strategy execution.
// It's how you communicate the result back to Passport.
//all other thin are mention in documentation

// Add debugging to check config values
// console.log("=== CONFIG DEBUG ===");
// console.log("GOOGLE_CLIENT_ID:", config.GOOGLE_CLIENT_ID);
// console.log(
//   "GOOGLE_CLIENT_SECRET:",
//   config.GOOGLE_CLIENT_SECRET ? "***SET***" : "UNDEFINED"
// );
// console.log("GOOGLE_CALLBACK_URL:", config.GOOGLE_CALLBACK_URL);
// console.log("==================");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { email, sub: googleId, picture } = profile._json;
        console.log(profile, "profile");
        console.log(googleId, "googleId");

        if (!googleId) {
          throw new NotFoundException("Google id (sub) is missing");
        }

        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName,
          providerId: googleId,
          picture: picture,
          email: email,
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async (email, password, done) => {
      try {
        const user = await verifyUserService(email, password);
        return done(null, user);
      } catch (error) {
        return done(error, false, { message: error?.message });
      }
    }
  )
);

// Login → Serialize runs → Session gets user data
// Every page visit → Deserialize runs → You get user object in req.user

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
