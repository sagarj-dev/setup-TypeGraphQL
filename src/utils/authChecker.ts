import { AuthChecker } from "type-graphql";
import Context from "../type/context";
import { verifyJwt } from "./jwt";
import { UserModel } from "../schema/user.schema";

const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  const { req } = context;

  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    const token = authorizationHeader.substring(7);
    const userId = verifyJwt(token);
    const user = await UserModel.findById(userId);

    if (user) {
      context.user = user;

      // Check if any of the user's roles are included in the roles required by the @Authorized decorator
      if (roles.length === 0 || roles.includes(user.role)) {
        return true;
      } else {
        throw new Error("Access denied! You don't have permissions.");
      }
    }
  }

  throw new Error("Authentication token missing or invalid.");
};

export default authChecker;
