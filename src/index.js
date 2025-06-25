// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import session from "cookie-session";
// import config from "./config/app.config.js";
// import connectDatabase from "./db/index.js";
// import { errorHandler } from "./middlewares/errorHandler.middleware.js";
// import { HTTPSTATUS } from "./config/http.config.js";
// import asyncHandler from "./utils/asyncHandler.js";
// import { BadRequestException } from "./utils/ApiError.js";
// import "./config/passport.config.js";
// import passport from "passport";
// import authRoutes from "./routes/auth.routes.js";

// connectDatabase();

// const app = express();
// const BASE_PATH = config.BASE_PATH;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   session({
//     name: "session",
//     keys: [config.SESSION_SECRET],
//     maxAge: 24 * 60 * 60,
//     secure: config.NODE_ENV === "production",
//     httpOnly: true,
//     sameSite: "lax",
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// app.use(
//   cors({
//     origin: config.FRONTEND_ORIGIN,
//     credentials: true,
//   })
// );

// app.get(
//   "/",
//   asyncHandler((req, res, next) => {
//     throw new BadRequestException("this is a bad request");
//     res.status(HTTPSTATUS.OK).send("Hi");
//   })
// );

// app.use(`${BASE_PATH}/auth`, authRoutes);

// app.use(errorHandler);

// app.listen(config.PORT, async () => {
//   console.log(
//     `Server is listening at port ${config.PORT} in ${config.NODE_ENV}`
//   );
// });
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import config from "./config/app.config.js";
import connectDatabase from "./db/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { HTTPSTATUS } from "./config/http.config.js";
import asyncHandler from "./utils/asyncHandler.js";
import { BadRequestException } from "./utils/ApiError.js";
import "./config/passport.config.js";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import isAuthenticated from "./middlewares/isAuthenticated.middleware.js";
import workSpaceRoutes from "./routes/workspace.routes.js";
import memberRoutes from "./routes/member.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

connectDatabase();

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(`config:${config.FRONTEND_ORIGIN}`);
// Configure CORS before session (important for credentials)
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Express session configuration
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGODB_URI,
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      sameSite: "lax",
    },
    name: "session",
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workSpaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

// app.get(
//   "/",
//   asyncHandler((req, res, next) => {
//     throw new BadRequestException("this is a bad request");
//     res.status(HTTPSTATUS.OK).send("Hi");
//   })
// );
// app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server is listening at port ${config.PORT} in ${config.NODE_ENV}`
  );
});
