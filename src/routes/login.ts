import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-erros";
import { prisma } from "../lib/prisma";

export async function login(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().post(
      "/user/login",
      {
        schema: {
        //   params: z.object({
        //     user_id: z.string().uuid()
        //   }),
          body: z.object({
            email: z.string().email(),
            password: z.string(),
          })
        },
      },
      async (request: any, reply: any) => {
        // const { trip_id } = request.params;
        const { email, password } = request.body;
        const user = await prisma.user.findFirst({
            select:{
              
              name: true,
              email: true,
              password: true,
            },
            where: {
              email: email,
              password: password
            },
          });
          if (!user) {
            throw new ClientError("User not found.");
          }
  
      
        return {message: 'OK'};
      }
    );

  }catch(e){
    console.log("Error: ", e)
  }
}
