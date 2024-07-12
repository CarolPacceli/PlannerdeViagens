import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "./errors/client-erros";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error: any, request: any, reply: any) => {
  console.log("error:", error)
  if(error instanceof ZodError){
    return reply.status(400).send({
        message: "Invalid input",
        errors: error.flatten().fieldErrors
    })
  }
  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message });
  }
  return reply.status(500).send({ message: "Internal server error"})
};
