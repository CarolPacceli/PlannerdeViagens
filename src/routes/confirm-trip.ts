import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";
import { env } from "../env";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:trip_id/confirm",
    {
      schema: {
        params: z.object({
          trip_id: z.string().uuid(),
        }),
      },
    },
    async (request: any, reply: any) => {

      const { trip_id } = request.params

      const trip = await prisma.trip.findUnique({
        where:{
          id: trip_id
        }, 
        include:{
          participants:{
            where: {
              is_owner: false
            }
          }
        }
      })

      if(!trip){
        throw new ClientError("Trip not found.")
      }

      if(trip?.is_confirmed){
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${trip_id}`)
      }

      await prisma.trip.update({
        where: { id: trip_id},
        data: { is_confirmed:  true}
       })

       const starts_at_formatted = dayjs(trip.starts_at).format('LL')
        const ends_at_formatted = dayjs(trip.ends_at).format('LL')


        
        const mail = await getMailClient();
        
        await Promise.all(
          trip.participants.map(async (participant)=> {
          const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`
          const message = await mail.sendMail({
            from: {
              name: "Nome da aplicacao sem nome",
              address: "nomedaaplicacao@semnome.com",
            },
            to: participant.email || "",
            subject: `Confirme sua viagem para ${trip.destination}`,
            html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
            <p>
              Você foi convidado para uma viagem para
              <strong>${trip.destination}</strong> nas datas
              <strong> ${starts_at_formatted}</strong> a <strong> ${ends_at_formatted}</strong>
            </p>
          
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
          
            <p>
              <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
          
            <p>
              Caso você não saiba o motivo desse email, favor
              desconsiderar.
            </p>
          </div>
          `.trim()
          });
          
          console.log(nodemailer.getTestMessageUrl(message));
        })
      )

      return { trip_id: request.params.trip_id }
    }
  );
}
