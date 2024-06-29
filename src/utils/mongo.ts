import mongoose from "mongoose";
import config from "config";

export async function connectToMongo() {
  console.log(" ===>", process.env.dbUri!);
  try {
    await mongoose.connect(process.env.dbUri!);
    console.log("Connected to Database");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
