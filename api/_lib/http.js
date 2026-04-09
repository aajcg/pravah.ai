const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function resolveAllowedOrigin(requestOrigin) {
  if (!requestOrigin) {
    return "";
  }

  if (CORS_ORIGINS.includes("*")) {
    return "*";
  }

  return CORS_ORIGINS.includes(requestOrigin) ? requestOrigin : "";
}

export function applyCors(req, res, methods) {
  const requestOrigin = req.headers.origin;
  const allowedOrigin = resolveAllowedOrigin(requestOrigin);

  if (!allowedOrigin) {
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (allowedOrigin !== "*") {
    res.setHeader("Vary", "Origin");
  }
}

export function handleOptions(req, res, methods) {
  applyCors(req, res, methods);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}

async function readRawBody(req) {
  if (typeof req.body === "string") {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  return await new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      resolve(raw);
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

export async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  const raw = await readRawBody(req);
  if (!raw || raw.trim().length === 0) {
    return {};
  }

  return JSON.parse(raw);
}
