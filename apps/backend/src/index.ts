import express from "express";
import cors from "cors";
import { env } from "./constants/env";
import appRouter from "./routes";

const app = express();
const port = env.port;

app.use(express.json());
app.use(cors({
    origin: env.corsOrigin
}));

app.use("/api",appRouter);

app.listen(port,() => {
    console.log(`Server running on port ${port}`);
});