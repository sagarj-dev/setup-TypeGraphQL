import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  RegisterUserInput,
  LoginInput,
  User,
  EmailVarificationInput,
} from "../schema/user.schema";
import UserService from "../service/users/user.service";
import Context from "../type/context";

@Resolver()
export default class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  createUser(@Arg("input") input: RegisterUserInput) {
    return this.userService.createUser(input);
  }

  @Mutation(() => User)
  login(@Arg("input") input: LoginInput, @Ctx() context: Context) {
    return this.userService.login(input, context);
  }

  @Mutation(() => User)
  verification(
    @Arg("input") input: EmailVarificationInput,
    @Ctx() context: Context
  ) {
    return this.userService.verification(input, context);
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: Context) {
    return context.user;
  }
}
