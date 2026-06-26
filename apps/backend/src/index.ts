import express, { type Request, type Response } from "express";
import cors from "cors";
import { env } from "./constants/env";

const app = express();
const port = env.port;

app.use(express.json());
app.use(cors({
    origin: env.cors_origin
}));

app.get("/api/health",(req: Request,res: Response) => {
    return res.status(200).json({success:true});
});

app.listen(port,() => {
    console.log(`Server running on port ${port}`);
});