import { connect } from "mongoose";

export const connectMongoDb = async () => {
  if (process.env.MONGODB_CONNECTION_STRING) {
    console.log({ mongoConnString: process.env.MONGODB_CONNECTION_STRING });
    return await connect(process.env.MONGODB_CONNECTION_STRING);
  }
  throw new Error(
    "MongoDb connection string not defined in process.env.MONGODB_CONNECTION_STRING."
  );
};
