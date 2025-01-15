import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-erros";
import { prisma } from "../lib/prisma";

export async function createUser(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().post(
      "/user/create",
      {
        schema: {
        //   params: z.object({
        //     user_id: z.string().uuid()
        //   }),
          body: z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string(),
          })
        },
      },
      async (request: any, reply: any) => {
        // const { trip_id } = request.params;
        const { name, email, password } = request.body;
        
        // const trip = await prisma.trip.findUnique({
        //   where:{
        //     id: trip_id
        //   }
        // })
  
        // if(!trip){
        //   throw new ClientError("Trip not found.")
        // }
  
        const user = await prisma.user.create({
          data: { 
            name,
            email,
            password
          },
        });
        
        return `user ${email} created`;
      }
    );

  }catch(e){
    console.log("Error: ", e)
  }
}
