import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-erros";
import { env } from "../env";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          title: z.string(),
          description: z.string(),
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (request: any) => {
      const {
        title,
        description,
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite,
      } = request.body;

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError("Invalid trip start date");
      }
      if (dayjs(starts_at).isAfter(ends_at)) {
        throw new ClientError("Invalid trip end date");
      }
      
      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          description,
          title,
          participants: {
            createMany: {
              data: [
                {
                  
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email: any) => {
                  return { email };
                }),
              ],
            },
          },
        },
      });
      const starts_at_formatted = dayjs(starts_at).format("LL");
      const ends_at_formatted = dayjs(ends_at).format("LL");

      const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: {
          name: "Nome da aplicacao sem nome",
          address: "nomedaaplicacao@semnome.com",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: `Confirme sua viagem para ${destination}`,
        html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
        <p>
          Você solicitou a criação de uma viagem para
          <strong>${destination}</strong> nas datas
          <strong> ${starts_at_formatted}</strong> a <strong> ${ends_at_formatted}</strong>
        </p>
      
        <p>Para confirmar sua viagem, clique no link abaixo:</p>
      
        <p>
          <a href="${confirmationLink}">Confirmar viagem</a>
        </p>
      
        <p>
          Caso você não saiba o motivo desse email, favor
          desconsiderar.
        </p>
      </div>
      `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { tripId: trip.id };
    }
  );
}
