import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-erros";
import { prisma } from "../lib/prisma";

export async function updateUser(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().put(
      "/user",
      {
        schema: {
        //   params: z.object({
        //     user_id: z.string().uuid()
        //   }),
          body: z.object({
            name: z.string(),
            email: z.string().email(),
          })
        },
      },
      async (request: any, reply: any) => {
        const { email, name } = request.body;
        const user_req = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(user_req && user_req.id){
        const user = await prisma.user.update({
            where:{
                id: user_req.id,
            },
            data:{
                name: name,
                
            },
          });
          if (!user) {
            throw new ClientError("Could not update user.");
          }
        }
          else {
            throw new ClientError("User not found.");
          }
  
      
        return {message: 'OK'};
      }
    );

  }catch(e){
    console.log("Error: ", e)
  }
}
