import dotenv from "dotenv";
import "reflect-metadata";
import express from "express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from "apollo-server-core";
import { resolvers } from "./resolvers";
import { connectToMongo } from "./utils/mongo";
import Context from "./type/context";
import authChecker from "./utils/authChecker";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { GraphQLRequestContext } from "apollo-server-types";
import winston from "winston";
import { blueBright, gray } from "colorette";
import { GraphQLError } from "graphql";
import dayjs from "dayjs";

dotenv.config();
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = JSON.stringify(meta, null, 2);

      return `[${level}] ${gray(
        dayjs(timestamp).format("hh:MM:s")
      )} ${blueBright(message)} ${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    // Add other transports like File, Http, etc., if needed
  ],
});

const loggingPlugin: ApolloServerPlugin = {
  requestDidStart(requestContext: GraphQLRequestContext): any {
    return {
      didResolveOperation({ operation }: GraphQLRequestContext) {
        logger.info(
          //@ts-ignore
          operation.selectionSet.selections[0].name.value
        );
      },
      didEncounterErrors({ errors }: { errors: GraphQLError }) {
        // console.log(" ===>", errors);
        // @ts-ignore
        logger.error(errors[0].extensions.code, errors);
      },
    };
  },
};

async function bootstrap() {
  // Build the schema

  const schema = await buildSchema({
    resolvers,
    authChecker,
  });

  // Init express
  const app = express();

  app.use(cookieParser());

  // Create the apollo server
  // Apollo server instance
  const server = new ApolloServer({
    schema,
    context: ({ req, res }: Context) => ({ req, res }),
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
      loggingPlugin,
    ],
  });

  await server.start();
  // apply middleware to server

  server.applyMiddleware({ app });

  // app.listen on express server
  app.listen({ port: 4000 }, () => {
    console.log("App is listening on http://localhost:4000/graphql");
  });
  connectToMongo();
}

bootstrap();
