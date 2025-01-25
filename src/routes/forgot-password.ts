import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-erros";
import { prisma } from "../lib/prisma";

export async function forgotPassword(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().put(
      "/user/password",
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
        const { email, password } = request.body;
        const user_req = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(user_req && user_req.id){
        const user = await prisma.user.update({
            where:{
                id: user_req.id
            },
            data:{
                password: password,
                
            },
          });
          if (!user) {
            throw new ClientError("Could not change password.");
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
