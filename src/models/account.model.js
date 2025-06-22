import mongoose, { Schema } from "mongoose";
import ProviderEnum from "../enums/account-provider-enums.js";
import UserModel from "./user.model.js";

export const accountSchema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      required: true,
    },
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    //so that in json response refresh token is not being send
    toJSON: {
      transform(doc, ret) {
        delete ret.refreshToken;
      },
    },
  }
);

const AccountModel = mongoose.model("Account", accountSchema);

export default AccountModel;
