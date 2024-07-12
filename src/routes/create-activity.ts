import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";

export async function createActivity(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().post(
      "/trips/:trip_id/activities",
      {
        schema: {
          params: z.object({
            trip_id: z.string().uuid()
          }),
          body: z.object({
            title: z.string(),
            ocurs_at: z.coerce.date(),
          })
        },
      },
      async (request: any, reply: any) => {
        const { trip_id } = request.params;
        const { title, ocurs_at } = request.body;
        console.log("body", title, ocurs_at)
        const trip = await prisma.trip.findUnique({
          where:{
            id: trip_id
          }
        })
  
        if(!trip){
          throw new ClientError("Trip not found.")
        }
  
        if (dayjs(ocurs_at).isBefore(trip.starts_at)) {
          throw new ClientError("Invalid activity date");
        }
  
        if (dayjs(ocurs_at).isAfter(trip.ends_at)) {
          throw new ClientError("Invalid activity date");
        }
  
        const activity = await prisma.activity.create({
          data: { 
            title,
            ocurs_at,
            trip_id
          },
        });
        
        return { activity_id: activity.id };
      }
    );

  }catch(e){
    console.log("Error: ", e)
  }
}
