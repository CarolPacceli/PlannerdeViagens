import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";

export async function getActivity(app: FastifyInstance) {
  try {
    app.withTypeProvider<ZodTypeProvider>().get(
      "/trips/:trip_id/activities",
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
          include: {
            activities: { orderBy: { ocurs_at: "asc" } },
          },
        });

        if (!trip) {
          throw new ClientError("Trip not found.");
        }
        const diferenceInDay = dayjs(trip.ends_at).diff(trip.starts_at, "days");

        const activities = Array.from({ length: diferenceInDay + 1 }).map(
          (_, index) => {
            const date = dayjs(trip.starts_at).add(index, "days");
            return {
              date: date.toDate(),
              activities: trip.activities.filter((activity) => {
                return dayjs(activity.ocurs_at).isSame(date, "day");
              }),
            };
          }
        );
        return { activities };
      }
    );
  } catch (e) {
    console.log("Error: ", e);
  }
}
