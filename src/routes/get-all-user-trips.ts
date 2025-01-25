import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";

export async function getAllUserTrips(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/all",
    {
      body: {
        params: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request: any, reply: any) => {
      const { email } = request.body;

      const participants = await prisma.participant.findMany({
        where: {
          email: email,
        },
      });
      const all_trips = await prisma.trip.findMany();
      
      let trips: any = [];
      await participants.forEach(participant_element => {
        trips.push(all_trips.find((itemT) => itemT.id === participant_element.trip_id))
        
      });
      
      if (!trips) {
        console.log("Chegou aqui");
        throw new ClientError("Trips not found.");
      }

      return { trips };
    }
  );
}
