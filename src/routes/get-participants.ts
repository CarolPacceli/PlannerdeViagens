import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";

export async function getParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:trip_id/participants",
    {
      schema: {
        params: z.object({
          trip_id: z.string().uuid(),
        }),
      },
    },
    async (request: any, reply: any) => {
      const { trip_id } = request.params;

      const trip = await prisma.trip.findUnique({
        where: {
          id: trip_id,
        },
        include:{
          participants: {
            select:{
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
            }
          }
        }
      });

      if (!trip) {
        throw new ClientError("Trip not found.");
      }

      return { participants: trip.participants };
    }
  );
}
