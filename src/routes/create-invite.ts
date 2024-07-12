import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-erros";
import { env } from "../env";

export async function createInvite(app: FastifyInstance) {
  try{
    app.withTypeProvider<ZodTypeProvider>().post(
      "/trips/:trip_id/invites",
      {
        schema: {
          params: z.object({
            trip_id: z.string().uuid()
          }),
          body: z.object({
            email: z.string().email()
          })
        },
      },
      async (request: any, reply: any) => {
        const { trip_id } = request.params;
        const { email } = request.body;
        
        const trip = await prisma.trip.findUnique({
          where:{
            id: trip_id
          }
        })
  
        if(!trip){
          throw new ClientError("Trip not found.")
        }
  
        const participant = await prisma.participant.create({
          data: { 
            email,
            trip_id
          },
        });

        const starts_at_formatted = dayjs(trip.starts_at).format('LL')
        const ends_at_formatted = dayjs(trip.ends_at).format('LL')
  
        const mail = await getMailClient();
        
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

        return { participant: participant.id };
      }
    );

  }catch(e){
    console.log("Error: ", e)
  }
}
