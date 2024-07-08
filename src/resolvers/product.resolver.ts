import { Authorized, Mutation, Resolver } from "type-graphql";
import { Arg, Ctx } from "type-graphql";
import { CreateProductInput, Product } from "../schema/product.schema";
import productService from "../service/product.service";
import Context from "../type/context";
import { ROLES } from "../contatnts/ROLES";

@Resolver()
export default class ProductResolver {
  @Authorized([ROLES.USER]) // we can  Allow both "user" and "admin" roles here
  @Mutation(() => Product)
  async createProduct(
    @Arg("input") input: CreateProductInput,
    @Ctx() { user }: Context
  ): Promise<Product> {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const productInput = { ...input, user: user._id };

    try {
      const createdProduct = await productService.createProduct(productInput);
      console.log("Created product:", createdProduct);
      return createdProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }
}
