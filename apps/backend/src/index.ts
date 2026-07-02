import express from "express";
import cors from "cors";
import { env } from "./constants/env";
import appRouter from "./routes";
import { createClient } from "redis";

const app = express();
const port = env.port;

app.use(express.json());
app.use(cors({
    origin: env.corsOrigin
}));

export const redisClient = createClient({
    url: env.redisUrl,
});

const main = async() => {
    (await redisClient.connect()).on("error",(error)=>{
        console.log("REDIS ERROR: ",error);
    });
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

app.use("/api", appRouter);

main();