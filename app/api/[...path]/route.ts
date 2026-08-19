import { handleProxy, normalizeProxyPath } from "../_lib/proxy";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function route(req: Request, context: RouteContext) {
  const { path } = await context.params;
  return handleProxy(req, normalizeProxyPath(path));
}

export function GET(req: Request, context: RouteContext) {
  return route(req, context);
}

export function POST(req: Request, context: RouteContext) {
  return route(req, context);
}

export function PUT(req: Request, context: RouteContext) {
  return route(req, context);
}

export function PATCH(req: Request, context: RouteContext) {
  return route(req, context);
}

export function DELETE(req: Request, context: RouteContext) {
  return route(req, context);
}

