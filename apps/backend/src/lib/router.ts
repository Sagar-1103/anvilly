import { env } from "../constants/env";
import { getCorsHeaders } from "./cors";

export type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Promise<Response> | Response;

export interface Route {
  method: string;
  path: string;
  parts: string[];
  handler: RouteHandler;
}

export class Router {
  routes: Route[] = [];

  use(prefix: string, router: Router): this {
    const cleanPrefix = prefix.replace(/\/+$/, "");
    for (const route of router.routes) {
      const fullPath = cleanPath(cleanPrefix + "/" + route.path);
      const parts = fullPath.split("/").filter(Boolean);
      this.routes.push({
        method: route.method,
        path: fullPath,
        parts,
        handler: route.handler,
      });
    }
    return this;
  }

  get(path: string, handler: RouteHandler): this {
    return this.addRoute("GET", path, handler);
  }

  post(path: string, handler: RouteHandler): this {
    return this.addRoute("POST", path, handler);
  }

  patch(path: string, handler: RouteHandler): this {
    return this.addRoute("PATCH", path, handler);
  }

  delete(path: string, handler: RouteHandler): this {
    return this.addRoute("DELETE", path, handler);
  }

  put(path: string, handler: RouteHandler): this {
    return this.addRoute("PUT", path, handler);
  }

  private addRoute(method: string, path: string, handler: RouteHandler): this {
    const cleaned = cleanPath(path);
    const parts = cleaned.split("/").filter(Boolean);
    this.routes.push({
      method: method.toUpperCase(),
      path: cleaned,
      parts,
      handler,
    });
    return this;
  }

  async handle(req: Request): Promise<Response | null> {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();

    const corsHeaders = getCorsHeaders(req);

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const urlParts = url.pathname.split("/").filter(Boolean);

    // Match route
    let bestRoute: Route | null = null;
    let bestParams: Record<string, string> = {};
    let highestScore = -1;

    for (const route of this.routes) {
      if (route.method !== method) continue;
      if (route.parts.length !== urlParts.length) continue;

      let match = true;
      let score = 0;
      const params: Record<string, string> = {};

      for (let i = 0; i < route.parts.length; i++) {
        const routePart = route.parts[i]!;
        const urlPart = urlParts[i]!;

        if (routePart.startsWith(":")) {
          params[routePart.slice(1)] = urlPart;
          score += 1;
        } else if (routePart === urlPart) {
          score += 2;
        } else {
          match = false;
          break;
        }
      }

      if (match && score > highestScore) {
        bestRoute = route;
        bestParams = params;
        highestScore = score;
      }
    }

    if (!bestRoute) {
      return null;
    }

    try {
      const res = await bestRoute.handler(req, bestParams);
      if (res && res.headers) {
        for (const [key, val] of Object.entries(corsHeaders)) {
          if (!res.headers.has(key)) {
            res.headers.set(key, val);
          }
        }
      }
      return res;
    } catch (err: any) {
      console.error(`Error handling ${method} ${url.pathname}:`, err);
      return Response.json(
        { success: false, message: err?.message || "Internal server error" },
        {
          status: err?.statusCode || 500,
          headers: corsHeaders,
        }
      );
    }
  }
}

function cleanPath(path: string): string {
  const normalized = "/" + path.split("/").filter(Boolean).join("/");
  return normalized === "/" ? "/" : normalized;
}
