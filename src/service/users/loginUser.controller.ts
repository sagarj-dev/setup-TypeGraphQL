import { ApolloError } from "apollo-server";
import bcrypt from "bcrypt";
import { LoginInput, UserModel } from "../../schema/user.schema";
import Context from "../../types/context";
import { generateToken } from "../../utils/jwt";

export const loginUser = async (input: LoginInput, context: Context) => {
  const e = "Invalid email or password";

  // Get our user by email
  const user = await UserModel.find().findByEmail(input.email).lean();

  if (!user) {
    throw new ApolloError(e);
  }

  // validate the password
  const passwordIsValid = await bcrypt.compare(input.password, user.password);

  if (!passwordIsValid) {
    throw new ApolloError(e);
  }

  // sign a jwt
  const token = generateToken(user._id);

  // set a cookie for the jwt
  context.res.cookie("accessToken", token, {
    maxAge: 3.154e10, // 1 year
    httpOnly: true,
    domain: "localhost",
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  // return the jwt
  return token;
};
