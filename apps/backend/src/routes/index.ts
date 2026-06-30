import { Router, type Request, type Response } from "express";
import projectRouter from "./project.route";

const appRouter = Router();

appRouter.get("/health",(req: Request,res: Response) => {
    return res.status(200).json({success:true});
});

appRouter.use("/projects",projectRouter);

export default appRouter;