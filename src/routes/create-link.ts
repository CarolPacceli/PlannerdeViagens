import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-erros";
import { prisma } from "../lib/prisma";

export async function createLink(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().post(
      "/trips/:trip_id/links",
      {
        schema: {
          params: z.object({
            trip_id: z.string().uuid()
          }),
          body: z.object({
            title: z.string(),
            url: z.string().url(),
          })
        },
      },
      async (request: any, reply: any) => {
        const { trip_id } = request.params;
        const { title, url } = request.body;
        
        const trip = await prisma.trip.findUnique({
          where:{
            id: trip_id
          }
        })
  
        if(!trip){
          throw new ClientError("Trip not found.")
        }
  
        const link = await prisma.link.create({
          data: { 
            title,
            url,
            trip_id
          },
        });
        
        return { link_id: link.id };
      }
    );

  }catch(e){
    console.log("Error: ", e)
  }
}
