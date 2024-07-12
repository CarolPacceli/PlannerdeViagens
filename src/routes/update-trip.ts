import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { prisma } from "../lib/prisma"; 
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:trip_id",
    {
      schema: {
        params: z.object({
          trip_id: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date()
        }),
      },
    },
    async (request: any) => {
      const { trip_id } = request.params;
      const {
        destination,
        starts_at,
        ends_at,
      } = request.body;
     
      const trip = await prisma.trip.findUnique({
        where: {
          id: trip_id,
        },
      });
      if (!trip) {
        throw new ClientError("Trip not found.");
      }
      if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError("Invalid trip start date");
      }
      if (dayjs(starts_at).isAfter(ends_at)) {
        throw new ClientError("Invalid trip end date");
      }

      const tripUpdate = await prisma.trip.update({
        where:{
          id: trip_id
        },
        data: {
          destination,
          starts_at,
          ends_at,
         
        },
      });

      return { tripId: trip.id };
    }
  );
}
