import type { Request, Response } from "express"
import type { EventType } from "./types";

export class EventStream {
    req:Request;
    res:Response;
    isConnected:boolean;

    constructor(req:Request,res:Response) {
        this.req = req;
        this.res = res;
        this.isConnected = false;
    }

    addHeaders() {
        this.res.setHeader("Content-Type","text/event-stream; charset=utf-8");
        this.res.setHeader("Cache-Control","no-cache, no-transform");
        this.res.setHeader("X-Accel-Buffering","no");
        this.res.setHeader("Connection","keep-alive");
        this.res.flushHeaders();
        this.isConnected = true;
    }

    send(event: EventType,data:any) {
        if (!this.isConnected) {
            console.log("Not connected");
            return;
        };
        this.res.write(`event: ${event}\n`);
        this.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    end() {
        this.req.on("close",()=>{
            this.isConnected = false;            
            this.res.end();
        })
    }

}