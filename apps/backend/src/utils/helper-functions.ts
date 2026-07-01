import type { Request, Response, NextFunction } from "express"
import type { Message } from "./types";

export const AsyncHandler = (fn: any) => async(req:Request, res:Response, next: NextFunction) => {
    try {
        await fn(req,res,next);
    } catch (error) {
        console.error("Error in AsyncHandler:", error);
        if (res.headersSent) {
            if (!res.writableEnded) {
                res.write(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : String(error) })}\n\n`);
                res.end();
            }
            return;
        }
        return res.status(500).json({success:false, error: error instanceof Error ? error.message : error});
    }
}

export const getUserId = (req:Request,res:Response) => {
    return req.userId;
}

export const parseHistory = (messages: Message[]) => {
    const history = messages.map((m) => {
        if (m.role!=="TOOL_CALL") {
            return `ROLE:${m.role}, CONTENT:${m.content}`
        } else {
            if (!m.name) {
                return `ROLE:${m.role}, CONTENT:${m.content}`;
            }
            return `ROLE:${m.role}, TOOL_NAME:${m.name}, ARGS:${m.arguments}, CALL_ID:${m.callId}, RESULT:${JSON.stringify(m.result)}`
        }
    }).join("\n\n");
    return history;
}