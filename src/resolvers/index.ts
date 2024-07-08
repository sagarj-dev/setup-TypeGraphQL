import UserResolver from "./user.resolver";
import ProductResolver from "./product.resolver";
import { Resolvers } from "../../types";

export const resolvers = [UserResolver, ProductResolver] as const;
