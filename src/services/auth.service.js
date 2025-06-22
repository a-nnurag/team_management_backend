import AccountModel from "../models/account.model.js";
import workspaceModel from "../models/workspace.model.js";
import roleModel from "../models/role-permission.model.js";
import UserModel from "../models/user.model.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/ApiError.js";
import memberModel from "../models/member.model.js";
import { Roles } from "../enums/role-enums.js";
import mongoose from "mongoose";
import ProviderEnum from "../enums/account-provider-enums.js";

export const loginOrCreateAccountService = async (data) => {
  const { provider, displayName, providerId, picture, email } = data;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Started session...");
    let user = await UserModel.findOne({ email }).session(session);

    //if user exist then no need of signing up
    if (!user) {
      //create a new user if it dosent exist
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });

      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });

      await account.save({ session });
      //creating a new workspace for the new user
      const workspace = new workspaceModel({
        name: `My Workspace `,
        description: `Workspace created for ${user.name}`,
        owner: `${user._id}`,
      });

      await workspace.save({ session });

      const ownerRole = await roleModel
        .findOne({
          name: Roles.OWNER,
        })
        .session(session);

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new memberModel({
        userId: user._id,
        workSpaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });

      await member.save({ session });

      user.currentWorkspace = workspace._id;
      await user.save({ session });
    }
    await session.commitTransaction();

    session.endSession();
    console.log("Sesson ended...");
    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

export const registerUserService = async (body) => {
  const { email, name, password } = body;

  const session = await mongoose.startSession();

  try {
    console.log("Session starts");

    session.startTransaction();

    const existingUser = await UserModel.findOne({ email }).session(session);

    if (existingUser) {
      throw new BadRequestException("Email already exist");
    }

    const user = new UserModel({
      email,
      name,
      password,
    });

    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });

    await account.save({ session });

    const workspace = new workspaceModel({
      name: `My Workspace `,
      description: `Workspace created for ${user.name}`,
      owner: `${user._id}`,
    });

    await workspace.save({ session });

    const ownerRole = await roleModel
      .findOne({
        name: Roles.OWNER,
      })
      .session(session);

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new memberModel({
      userId: user._id,
      workSpaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });

    await member.save({ session });

    user.currentWorkspace = workspace._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("Session ends");

    return {
      userId: user._id,
      workspaceId: workspace._id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// export const verifyUserService = async (
//   email,
//   password,
//   provider = ProviderEnum.EMAIL
// ) => {
//   const account = await AccountModel.findOne({ provider, providerId: email });

//   if (!account) {
//     throw new NotFoundException("Invalid email or password");
//   }

//   const user = await UserModel.findById(account.userId);

//   if (!user) {
//     throw new NotFoundException("User not found for given account");
//   }

//   const isMatch = await user.comparePasswords(password);

//   if (!isMatch) {
//     throw new UnauthorizedException("Invalid email or password");
//   }

//   return user.removePassword();
// };

export const verifyUserService = async (
  email,
  password,
  provider = ProviderEnum.EMAIL
) => {
  let account;

  if (provider === ProviderEnum.EMAIL) {
    // For email provider, providerId is the email
    account = await AccountModel.findOne({
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
  } else {
    // For OAuth providers, find user by email first, then get their account
    const user = await UserModel.findOne({ email });
    if (user) {
      account = await AccountModel.findOne({
        userId: user._id,
        provider,
      });
    }
  }

  if (!account) {
    throw new NotFoundException("Invalid email or password");
  }

  const user = await UserModel.findById(account.userId);

  if (!user) {
    throw new NotFoundException("User not found for given account");
  }

  // Only verify password for email-based accounts
  if (provider === ProviderEnum.EMAIL) {
    if (!user.password) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isMatch = await user.comparePasswords(password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }
  } else {
    // For OAuth users, password shouldn't be provided
    if (password) {
      throw new BadRequestException("Password not required for OAuth login");
    }
  }

  return user.removePassword();
};
