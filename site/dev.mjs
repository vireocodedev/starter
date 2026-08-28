import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildWebsite } from "./build.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputRoot = join(root, "site/dist");
const port = Number(process.env.VIREO_SITE_PORT ?? 4173);
buildWebsite({ root, outputRoot });

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
};

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  if (pathname.includes("..")) {
    response.writeHead(400).end("Invalid path");
    return;
  }
  let target = join(outputRoot, pathname);
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
  if (!existsSync(target)) target = join(outputRoot, "404.html");
  response.writeHead(target.endsWith("404.html") ? 404 : 200, {
    "Cache-Control": "no-store",
    "Content-Type": types[extname(target)] ?? "application/octet-stream",
  });
  createReadStream(target).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Vireo website available at http://127.0.0.1:${port}`);
});
