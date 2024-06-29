import { getModelForClass, pre, prop } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";

@pre<User>("save", async function () {
  // Check that the password is being modified
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hashSync(this.password, salt);
})
@ObjectType()
export class User {
  @Field(() => String, { name: "id" })
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  password: string;

  @Field()
  token?: string;
}

export const UserModel = getModelForClass<typeof User>(User);

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @IsEmail()
  @Field()
  email: string;

  @MinLength(6, {
    message: "password must be at least 6 characters long",
  })
  @MaxLength(12, {
    message: "password must not be longer than 50 characters",
  })
  @Field()
  password: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
