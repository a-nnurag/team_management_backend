import mongoose from "mongoose";
import connectDatabase from "../db/index.js";
import roleModel from "../models/role-permission.model.js";
import RolePermissions from "../utils/role-permission.js";

const seedRoles = async () => {
  console.log("Seeding roles started");

  try {
    // Connect to database first
    await connectDatabase();
    console.log("Database connected s uccessfully");

    // Start session after connection is established
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      console.log("Clearing existing roles");
      await roleModel.deleteMany({}, { session });

      for (const roleName in RolePermissions) {
        const permissions = RolePermissions[roleName];

        // Since we cleared all roles, we can directly create new ones
        const newRole = new roleModel({
          name: roleName,
          permission: permissions,
        });
        await newRole.save({ session });
        console.log(`Role ${roleName} added with permissions`);
      }

      await session.commitTransaction();
      console.log("Transaction committed successfully");
    } catch (error) {
      await session.abortTransaction();
      console.log(`Error during seeding:`, error);
      throw error;
    } finally {
      session.endSession();
      console.log("Session ended");
    }
  } catch (error) {
    console.log(`Error during seeding:`, error);
    throw error;
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seedRoles().catch((error) =>
  console.error("Error running seed script:", error)
);
