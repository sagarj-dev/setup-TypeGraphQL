import { ApolloError } from "apollo-server";
import { RegisterUserInput, UserModel } from "../../schema/user.schema";
import { generateToken } from "../../utils/jwt";

export const createUser = async (input: RegisterUserInput) => {
  const createdUser = await UserModel.create(input);
  if (!createdUser) {
    throw new ApolloError("Failed to create user");
  }

  return { ...createdUser.toJSON(), token: generateToken(createdUser._id) };
};
