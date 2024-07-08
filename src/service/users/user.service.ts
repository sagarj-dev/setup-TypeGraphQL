import { ApolloError } from "apollo-server-errors";
import bcrypt from "bcrypt";
import {
  RegisterUserInput,
  LoginInput,
  UserModel,
  EmailVarificationInput,
} from "../../schema/user.schema";
import Context from "../../type/context";
import { generateToken } from "../../utils/jwt";

class UserService {
  async createUser(input: RegisterUserInput) {
    const isExists = await UserModel.exists({
      email: input.email.toLowerCase(),
    });

    if (isExists) {
      throw new ApolloError("User already exists", "EMAIL_EXISTS");
    }

    const createdUser = await UserModel.create({
      ...input,
      isVerified: false,
      // verificationCode: Math.floor(100000 + Math.random() * 900000),
    });

    if (!createdUser) {
      throw new ApolloError("Failed to create user");
    }

    return { ...createdUser.toJSON() };
  }
  async login(input: LoginInput, context: Context) {
    const user = await UserModel.findOne({ email: input.email });

    if (!user) {
      throw new ApolloError("User not found", "USER_NOT_FOUND");
    }

    if (!user.isVerified) {
      throw new ApolloError("User not verified", "USER_NOT_VERIFIED");
    }

    const passwordIsValid = await bcrypt.compare(input.password, user.password);

    if (!passwordIsValid) {
      throw new ApolloError("Invalid password", "INVALID_PASSWORD");
    }

    return { ...user.toJSON() };
  }

  async verification(input: EmailVarificationInput, context: Context) {
    const { varification_code, email } = input;

    try {
      const user = await UserModel.findOne({
        email: email,
      });

      if (!user) {
        throw new ApolloError("User not found", "INVALID_USER");
      }

      if (user.verificationCode !== +varification_code) {
        throw new ApolloError(
          "Invalid verification code",
          "INVALID_VARIFICATION_CODE"
        );
      }

      user.isVerified = true;
      const token = generateToken(user._id);

      return { ...user.toJSON(), token };
    } catch (error) {
      throw new ApolloError(
        "An error occurred during verification",
        "VERIFICATION_ERROR"
      );
    }
  }
}

export default UserService;
