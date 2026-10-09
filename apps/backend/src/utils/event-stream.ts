import type { EventType } from "./types";
import { env } from "../constants/env";
import { getCorsHeaders } from "../lib/cors";

export class EventStream {
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private encoder = new TextEncoder();
  public isConnected: boolean = true;
  public response: Response;
  public req: {
    on: (event: string, fn: () => void) => void;
    once: (event: string, fn: () => void) => void;
    off: (event: string, fn: () => void) => void;
  };

  constructor(reqOrSignal?: Request | AbortSignal) {
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    this.writer = writable.getWriter();

    const signal: AbortSignal | undefined =
      reqOrSignal instanceof Request
        ? reqOrSignal.signal
        : (reqOrSignal as AbortSignal | undefined);

    const closeListeners = new Set<() => void>();

    this.req = {
      on: (event: string, fn: () => void) => {
        if (event === "close") closeListeners.add(fn);
      },
      once: (event: string, fn: () => void) => {
        if (event === "close") {
          const wrapper = () => {
            closeListeners.delete(wrapper);
            fn();
          };
          closeListeners.add(wrapper);
        }
      },
      off: (event: string, fn: () => void) => {
        if (event === "close") closeListeners.delete(fn);
      },
    };

    const handleClose = () => {
      this.isConnected = false;
      closeListeners.forEach((fn) => fn());
      this.writer.close().catch(() => {});
    };

    if (signal) {
      if (signal.aborted) {
        handleClose();
      } else {
        signal.addEventListener("abort", handleClose);
      }
    }

    const corsHeaders = getCorsHeaders(
      reqOrSignal instanceof Request ? reqOrSignal : undefined
    );

    this.response = new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        ...corsHeaders,
      },
    });
  }

  addHeaders() {
    this.isConnected = true;
  }

  sendPing() {
    if (!this.isConnected) return;
    this.writer.write(this.encoder.encode(": keep-alive\n\n")).catch(() => {
      this.isConnected = false;
    });
  }

  send(event: EventType, data: any) {
    if (!this.isConnected) {
      return;
    }
    const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.writer.write(this.encoder.encode(chunk)).catch(() => {
      this.isConnected = false;
    });
  }

  end() {
    if (!this.isConnected) return;
    this.isConnected = false;
    this.writer.close().catch(() => {});
  }
}