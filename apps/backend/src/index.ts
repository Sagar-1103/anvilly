import express from "express";
import cors from "cors";
import { env } from "./constants/env";
import appRouter from "./routes";
import { connectRedis } from "./utils/redis";

const app = express();
const port = env.port;

app.use(express.json());
app.use(cors({
    origin: env.corsOrigin
}));

const main = async() => {
    await connectRedis();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

app.use("/api", appRouter);

main();