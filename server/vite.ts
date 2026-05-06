import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Serve the pre-built Angular app (angular-client build output)
export async function setupVite(app: Express, _server: Server) {
  const angularDist = path.resolve(import.meta.dirname, "..", "dist", "public", "browser");

  if (!fs.existsSync(angularDist)) {
    log("Angular build not found – run: cd angular-client && ng build --configuration development");
    // Minimal fallback
    app.use("*", (_req, res) => {
      res.status(503).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:3rem">
          <h1>Building Angular app...</h1>
          <p>Run <code>cd angular-client && node ../node_modules/@angular/cli/bin/ng.js build --configuration development</code></p>
        </body></html>
      `);
    });
    return;
  }

  app.use(express.static(angularDist));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(angularDist, "index.html"));
  });

  log("Serving Angular app from dist/public/browser");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public", "browser");
  const fallbackPath = path.resolve(import.meta.dirname, "public");

  const servePath = fs.existsSync(distPath) ? distPath : fallbackPath;

  if (!fs.existsSync(servePath)) {
    throw new Error(
      `Could not find the build directory: ${servePath}, make sure to build the Angular client first`,
    );
  }

  app.use(express.static(servePath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(servePath, "index.html"));
  });
}
