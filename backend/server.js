// Backend Film Management — Node.js murni, tanpa dependensi.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// .env sederhana (opsional)
try {
  const envFile = path.join(__dirname, ".env");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const PORT = parseInt(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const BASE_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const MAX_BODY = 8 * 1024 * 1024;

const dbm = require("./src/db");
const { verifyToken } = require("./src/auth");
const { parseMultipart } = require("./src/multipart");
const register = require("./src/routes");
const { HttpError, UPLOAD_DIR } = register;

dbm.load();
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---- router ----
const routes = [];
register((method, pattern, handler) => {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:([A-Za-z_]+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "/?$");
  routes.push({ method, re, keys, handler });
});

const MIME = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };

function cors(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN === "*" ? (origin || "*") : CORS_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(data) });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, "Request terlalu besar")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function serveStatic(res, rel) {
  const name = path.basename(decodeURIComponent(rel)); // cegah path traversal
  const file = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    console.log(`[static] file tidak ada: ${file}`);
    return send(res, 404, { success: false, message: "File tidak ditemukan" });
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(name).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "public, max-age=86400",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  try {
    const url = new URL(req.url, BASE_URL);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/") {
      return send(res, 200, { success: true, message: "Film Management API berjalan", docs: "/api/health" });
    }
    if (req.method === "GET" && pathname.startsWith("/api/static/")) {
      return serveStatic(res, pathname.slice("/api/static/".length));
    }

    let matched = null;
    let pathExists = false;
    for (const r of routes) {
      const m = r.re.exec(pathname);
      if (!m) continue;
      pathExists = true;
      if (r.method !== req.method) continue;
      matched = { r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
      break;
    }
    if (!matched) {
      return send(res, pathExists ? 405 : 404, { success: false, message: pathExists ? "Method tidak diizinkan" : "Endpoint tidak ditemukan" });
    }

    // body
    let body = {};
    let files = [];
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const raw = await readBody(req);
      const ct = req.headers["content-type"] || "";
      if (ct.includes("multipart/form-data")) {
        ({ fields: body, files } = parseMultipart(raw, ct));
      } else if (raw.length) {
        try { body = JSON.parse(raw.toString("utf8")); } catch { throw new HttpError(400, "Body JSON tidak valid"); }
        if (body === null || typeof body !== "object") body = {};
      }
    }

    // auth opsional: user diisi bila token valid dan user masih ada
    let user = null;
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) {
      const payload = verifyToken(auth.slice(7));
      if (payload) user = dbm.get().users.find((u) => u.id === payload.sub) || null;
    }

    const ctx = { req, params: matched.params, query: Object.fromEntries(url.searchParams), body, files, user, baseUrl: BASE_URL };
    const result = await matched.r.handler(ctx);
    send(res, result.status, result.body);
  } catch (err) {
    if (err instanceof HttpError || err.status) return send(res, err.status, { success: false, message: err.message });
    console.error(err);
    send(res, 500, { success: false, message: "Terjadi kesalahan pada server" });
  }
});

server.listen(PORT, () => {
  console.log(`\nFilm Management API jalan di ${BASE_URL}`);
  console.log(`Base URL untuk frontend: ${BASE_URL}/api`);
  console.log("Akun contoh -> admin: admin@example.com / admin123 | user: demo@example.com / demo123\n");
});
