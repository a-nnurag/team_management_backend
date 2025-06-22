import mongoose, { Schema } from "mongoose";
import { compareHashValue, hashValue } from "../utils/bcrypt.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: true,
    },
    profilePicture: {
      type: String,
      default: null,
      required: false,
    },
    currentWorkspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastlogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();

  this.password = await hashValue(this.password, 10);
  next();
});

userSchema.methods.removePassword = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePasswords = function (value) {
  return compareHashValue(value, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
