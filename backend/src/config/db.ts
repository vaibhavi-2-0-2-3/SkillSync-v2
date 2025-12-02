import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
}
