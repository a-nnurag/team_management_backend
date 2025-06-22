import mongoose from "mongoose";
import config from "../config/app.config.js";
import { DB_NAME } from "../constant.js";

const connectDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Successfully connected to db ${DB_NAME} at host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error in connecting to DB", error);
    process.exit(1); // 1 is a generic error code
    // 0 is a success code
  }
};

export default connectDatabase;

