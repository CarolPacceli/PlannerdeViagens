import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import cors from "@fastify/cors"
import { confirmTrip } from "./routes/confirm-trip";
import { createTrip } from "./routes/create-trip";
import { confirmParticipant } from "./routes/confirm-participant";
import { createActivity } from "./routes/create-activity";
import { getActivity } from "./routes/get-activities";
import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { createInvite } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";
import { getTrip } from "./routes/get-trip";
import { getParticipant } from "./routes/get-participant";
import { errorHandler } from "./error-handler";
import { env } from "./env";



const app = fastify()

app.register(cors, {
    origin: '*'
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(updateTrip)
app.register(getTrip)


app.register(confirmParticipant)
app.register(getParticipants)
app.register(getParticipant)

app.register(createInvite)

app.register(createActivity)
app.register(getActivity)

app.register(createLink)
app.register(getLinks)

app.listen({port: env.PORT}).then(() => {
    console.log("It's on")
})

