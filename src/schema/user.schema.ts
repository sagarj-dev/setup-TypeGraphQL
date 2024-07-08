import { getModelForClass, pre, prop } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";

// Pre-save hook to hash the password before saving and set the verification code
@pre<User>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})
// User model class
@ObjectType()
export class User {
  @Field(() => String, { name: "id" })
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  @IsEmail()
  email: string;

  @Field(() => String)
  @prop({ required: true })
  password: string;

  @Field(() => String)
  @prop({ required: true })
  role: string;

  @Field(() => Boolean)
  @prop({ default: false })
  isVerified: boolean;

  @Field(() => Number)
  @prop()
  verificationCode: number;

  @Field()
  token?: string;
}

export const UserModel = getModelForClass(User);

// Input type for creating a new user
@InputType()
export class RegisterUserInput {
  @Field()
  name: string;

  @IsEmail()
  @Field()
  email: string;

  @MinLength(6, {
    message: "password must be at least 6 characters long",
  })
  @MaxLength(50, {
    message: "password must not be longer than 50 characters",
  })
  @Field()
  password: string;

  @Field()
  role: string;

  @Field({ defaultValue: false })
  isVerified: boolean;
}

// Input type for logging in a user
@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

//VerificationInput
@InputType()
export class EmailVarificationInput {
  @Field(() => String)
  varification_code: string;

  @Field(() => String)
  email: string;
}
