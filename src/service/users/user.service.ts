import { ApolloError } from "apollo-server-errors";
import bcrypt from "bcrypt";
import {
  CreateUserInput,
  LoginInput,
  UserModel,
} from "../../schema/user.schema";
import Context from "../../types/context";
import { generateToken } from "../../utils/jwt";

const createUser = async (input: CreateUserInput) => {
  const createdUser = await UserModel.create(input);
  if (!createdUser) {
    throw new ApolloError("Failed to create user");
  }

  return { ...createdUser.toJSON(), token: generateToken(createdUser._id) };
};

class UserService {
  // <========= Create User =========>
  async createUser(input: CreateUserInput) {
    const isExists = await UserModel.exists({
      email: input.email.toLowerCase(),
    });

    if (isExists) {
      throw new ApolloError("User already exists", "EMAIL_EXISTS");
    }

    const createdUser = await UserModel.create(input);

    if (!createdUser) {
      throw new ApolloError("Failed to create user");
    }

    return { ...createdUser.toJSON(), token: generateToken(createdUser._id) };
  }

  // <========= Login User =========>
  async login(input: LoginInput, context: Context) {
    // Get our user by email
    const user = await UserModel.findOne({ email: input.email }).lean();

    if (!user) {
      throw new ApolloError("User not found", "USER_NOT_FOUND");
    }

    // validate the password
    const passwordIsValid = await bcrypt.compare(input.password, user.password);

    if (!passwordIsValid) {
      throw new ApolloError("Invalid password", "INVALID_PASSWORD");
    }

    // sign a jwt
    const token = generateToken(user._id);

    // return the jwt
    return { ...user, token };
  }
}

export default UserService;
