import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participant_id",
    {
      schema: {
        params: z.object({
          participant_id: z.string().uuid(),
        }),
      },
    },
    async (request: any, reply: any) => {
      const { participant_id } = request.params;

      const participant = await prisma.participant.findUnique({
        select:{
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
        where: {
          id: participant_id,
        },
      });

      if (!participant) {
        throw new ClientError("Participant not found.");
      }

      return { participant };
    }
  );
}
