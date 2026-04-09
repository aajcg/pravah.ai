import { applyCors, handleOptions } from "./_lib/http.js";

const ALLOWED_METHODS = "GET,OPTIONS";

export default async function handler(req, res) {
  if (handleOptions(req, res, ALLOWED_METHODS)) {
    return;
  }

  applyCors(req, res, ALLOWED_METHODS);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({ status: "ok" });
}
