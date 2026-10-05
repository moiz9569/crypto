import mongoose from "mongoose";
import { connectMongoose } from "../mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    providerIds: {
      googleId: {
        type: String,
        default: null,
        index: true,
        sparse: true,
      },
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

// Prevent model recompilation during Next.js hot reload.
export async function getUserModel() {
  await connectMongoose();
  return mongoose.models.User || mongoose.model("User", UserSchema);
}
