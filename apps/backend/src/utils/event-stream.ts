import type { Request, Response } from "express"
import type { EventType } from "./types";

export class EventStream {
    req:Request;
    res:Response;

    constructor(req:Request,res:Response) {
        this.req = req;
        this.res = res;
    }

    addHeaders() {
        this.res.setHeader("Content-Type","text/event-stream; charset=utf-8");
        this.res.setHeader("Cache-Control","no-cache, no-transform");
        this.res.setHeader("X-Accel-Buffering","no");
        this.res.setHeader("Connection","keep-alive");
        this.res.flushHeaders();
    }

    send(event: EventType,data:any) {
        this.res.write(`event: ${event}\n`);
        this.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    autoEnd() {
        this.req.on("close",()=>{
            this.res.end();
        })
    }

    forceEnd() {
        this.res.end();
    }
    
}