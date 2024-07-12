import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";
import { env } from "../env";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participant_id/confirm",
    {
      schema: {
        params: z.object({
          participant_id: z.string().uuid(),
        }),
      },
    },
    async (request: any, reply: any) => {

      const { participant_id } = request.params

      const participant = await prisma.participant.findUnique({
        where:{
          id: participant_id
        }, 
      })

      if(!participant){
        throw new ClientError("Participant not found.")
      }

      if(participant?.is_confirmed){
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
      }

      await prisma.participant.update({
        where: { id: participant_id},
        data: { is_confirmed:  true}
       })

      return { trip_id: request.params.trip_id }
    }
  );
}
