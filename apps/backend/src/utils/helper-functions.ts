import type { Request, Response, NextFunction } from "express"
import type { Chunk, Message } from "./types";

export const AsyncHandler = (fn: any) => async(req:Request, res:Response, next: NextFunction) => {
    try {
        fn(req,res,next);
    } catch (error) {
        return res.status(500).json({success:false,error});
    }
}

export const getUserId = (req:Request,res:Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(403).json({success:false,message:"User id not found"});
    }
    return userId;
}

export const sendChunk = (data:Chunk,res:Response) => {
    res.write(JSON.stringify(data) + "\n");
}

export const endStream = (res:Response) => {
    res.on("close", () => {
        res.end();
    });
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