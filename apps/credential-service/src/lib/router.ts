import { getCorsHeaders } from "./cors";

export type RouteHandler = (req: Request, params?: any) => Promise<Response> | Response;

export class Router {
  routes: { method: string; path: string; handler: RouteHandler }[] = [];
  middlewares: any[] = [];

  use(prefixOrMiddleware: string | any, router?: Router) {
    if (typeof prefixOrMiddleware === "string" && router) {
      for (const route of router.routes) {
        let handler = route.handler;
        for (let i = router.middlewares.length - 1; i >= 0; i--) {
          handler = router.middlewares[i](handler);
        }
        this.routes.push({
          method: route.method,
          path: prefixOrMiddleware + route.path,
          handler,
        });
      }
    } else {
      this.middlewares.push(prefixOrMiddleware);
    }
  }

  get(path: string, handler: RouteHandler) { this.routes.push({ method: "GET", path, handler }); }
  post(path: string, handler: RouteHandler) { this.routes.push({ method: "POST", path, handler }); }
  patch(path: string, handler: RouteHandler) { this.routes.push({ method: "PATCH", path, handler }); }
  delete(path: string, handler: RouteHandler) { this.routes.push({ method: "DELETE", path, handler }); }
  put(path: string, handler: RouteHandler) { this.routes.push({ method: "PUT", path, handler }); }

  async handle(req: Request): Promise<Response | null> {
    const url = new URL(req.url);
    const method = req.method;
    const corsHeaders = getCorsHeaders(req);

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    for (const route of this.routes) {
      const routeParts = route.path.split("/").filter(Boolean);
      const urlParts = url.pathname.split("/").filter(Boolean);

      if (route.method === method && routeParts.length === urlParts.length) {
        let match = true;
        const params: Record<string, string> = {};
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i]!.startsWith(":")) {
            params[routeParts[i]!.slice(1)] = urlParts[i]!;
          } else if (routeParts[i] !== urlParts[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          try {
            let handler = route.handler;
            for (let i = this.middlewares.length - 1; i >= 0; i--) {
              handler = this.middlewares[i](handler);
            }
            const res = await handler(req, params);
            if (res && res.headers) {
              for (const [key, value] of Object.entries(corsHeaders)) {
                res.headers.set(key, value);
              }
            }
            return res;
          } catch (err: any) {
            return Response.json(
              { success: false, message: err.message || "Internal server error" },
              {
                status: err.statusCode || 500,
                headers: corsHeaders,
              }
            );
          }
        }
      }
    }
    return null;
  }
}
