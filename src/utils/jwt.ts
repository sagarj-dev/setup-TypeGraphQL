import jwt from "jsonwebtoken";

const JWT_SECRET = `${process.env.JWT_SECRET_KEY}` as string;

// Function to generate a JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "10d",
  });
};
export interface JwtExpPayload {
  id: string;
  iat: number;
  exp: number;
}
// Function to verify a JWT token
export const verifyJwt = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtExpPayload;
    if (decoded.id) {
      return decoded.id;
    }
    throw new Error("Invalid token");
  } catch (error) {
    throw new Error("Invalid token");
  }
};
