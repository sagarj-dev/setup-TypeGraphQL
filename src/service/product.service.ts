import {
  CreateProductInput,
  GetProductInput,
  ProductModel,
} from "../schema/product.schema";
import { User } from "../schema/user.schema";

class ProductService {
  async createProduct(input: CreateProductInput & { user: User["_id"] }) {
    return ProductModel.create(input);
  }

  async findProducts() {
    return ProductModel.find().lean();
  }

  async findSingleProduct(input: GetProductInput) {
    return ProductModel.findOne(input).lean();
  }
}

const productService = new ProductService();

export default productService;
