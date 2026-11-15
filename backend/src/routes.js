const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dbm = require("./db");
const { hashPassword, verifyPassword, signToken } = require("./auth");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (m) => new HttpError(400, m);

const reply = (data, message = "OK", status = 200, extra = {}) => ({ status, body: { success: true, message, data, ...extra } });

const str = (v) => (typeof v === "string" ? v.trim() : "");
const page = (q, def = 10) => {
  const p = Math.max(1, parseInt(q.page) || 1);
  const take = Math.min(100, Math.max(1, parseInt(q.take ?? q.limit) || def));
  return { p, take };
};

function requireAuth(ctx) {
  if (!ctx.user) throw new HttpError(401, "Token tidak valid atau belum login");
  return ctx.user;
}
function requireAdmin(ctx) {
  const u = requireAuth(ctx);
  if (u.role !== "admin") throw new HttpError(403, "Hanya admin yang boleh melakukan ini");
  return u;
}

// ---------- serializers ----------
const publicUser = (u) => ({ id: u.id, username: u.username, display_name: u.display_name, email: u.email, role: u.role, created_at: u.created_at });
const miniUser = (u) => (u ? { id: u.id, username: u.username, display_name: u.display_name } : undefined);

function imageUrl(ctx, name) {
  if (/^https?:\/\//.test(name)) return name;
  return `${ctx.baseUrl}/api/static/${name}`;
}

function reviewView(db, r) {
  return {
    ...r,
    user: miniUser(db.users.find((u) => u.id === r.user_id)),
    reactions: db.reactions.filter((x) => x.review_id === r.id).map((x) => ({ ...x, type: x.status })),
  };
}

function filmView(ctx, f, detail = false) {
  const db = dbm.get();
  const reviews = db.reviews.filter((r) => r.film_id === f.id);
  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  const year = parseInt(String(f.release_date).slice(0, 4)) || undefined;
  const out = {
    id: f.id, title: f.title, synopsis: f.synopsis, director: f.director || undefined,
    release_date: f.release_date, release_year: year, airing_status: f.airing_status,
    total_episodes: f.total_episodes, average_rating: avg,
    images: f.images.map((i) => imageUrl(ctx, i)),
    genres: f.genre_ids.map((id) => db.genres.find((g) => g.id === id)).filter(Boolean).map((g) => ({ id: g.id, name: g.name, description: g.description })),
    created_at: f.created_at,
  };
  if (detail) out.reviews = reviews.map((r) => reviewView(db, r)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return out;
}

function listView(db, l) {
  const film = db.films.find((f) => f.id === l.film_id);
  return { ...l, film_title: film?.title ?? null };
}

function parseDate(s) {
  const v = str(s);
  if (!v || isNaN(new Date(v.replace(" ", "T")).getTime())) throw bad("Format release_date tidak valid");
  return v;
}

// ---------- routes ----------
module.exports = function register(add) {
  add("GET", "/api/health", () => reply({ status: "ok", time: new Date().toISOString() }));

  // ----- auth -----
  add("POST", "/api/auth/register", (ctx) => {
    const db = dbm.get();
    const username = str(ctx.body.username);
    const email = str(ctx.body.email).toLowerCase();
    const password = typeof ctx.body.password === "string" ? ctx.body.password : "";
    if (username.length < 3 || username.length > 30) throw bad("Username harus 3-30 karakter");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw bad("Email tidak valid");
    if (password.length < 6) throw bad("Password minimal 6 karakter");
    if (db.users.some((u) => u.email === email)) throw new HttpError(409, "Email sudah terdaftar");
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) throw new HttpError(409, "Username sudah dipakai");
    const user = { id: dbm.uid(), username, display_name: str(ctx.body.display_name) || username, email, password: hashPassword(password), role: "user", created_at: dbm.now() };
    db.users.push(user);
    dbm.save();
    return reply(publicUser(user), "Registrasi berhasil", 201);
  });

  add("POST", "/api/auth/login", (ctx) => {
    const db = dbm.get();
    const email = str(ctx.body.email).toLowerCase();
    const password = typeof ctx.body.password === "string" ? ctx.body.password : "";
    const user = db.users.find((u) => u.email === email);
    // 400 (bukan 401): interceptor frontend me-redirect ke /login pada setiap 401
    if (!user || !verifyPassword(password, user.password)) throw bad("Email atau password salah");
    const token = signToken({ sub: user.id, role: user.role });
    return reply({ token, role: user.role }, "Login berhasil");
  });

  add("GET", "/api/auth/me", (ctx) => {
    const u = requireAuth(ctx);
    return reply({ personal_info: publicUser(u) });
  });

  // ----- genres -----
  add("GET", "/api/genres", () => {
    const db = dbm.get();
    const data = db.genres.map(({ id, name, description, created_at, updated_at }) => ({ id, name, description, created_at, updated_at }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return reply(data);
  });

  add("GET", "/api/genres/admin", (ctx) => {
    requireAdmin(ctx);
    const db = dbm.get();
    const { p, take } = page(ctx.query);
    const all = [...db.genres].sort((a, b) => a.name.localeCompare(b.name));
    const totalPages = Math.max(1, Math.ceil(all.length / take));
    return reply(all.slice((p - 1) * take, p * take), "OK", 200, {
      meta: { page: p, limit: take, total: all.length, totalPages, hasNextPage: p < totalPages, hasPrevPage: p > 1 },
    });
  });

  add("POST", "/api/genres", (ctx) => {
    requireAdmin(ctx);
    const db = dbm.get();
    const name = str(ctx.body.name);
    if (!name) throw bad("Nama genre wajib diisi");
    if (db.genres.some((g) => g.name.toLowerCase() === name.toLowerCase())) throw new HttpError(409, "Genre sudah ada");
    const g = { id: dbm.uid(), name, description: str(ctx.body.description), created_at: dbm.now(), updated_at: dbm.now() };
    db.genres.push(g);
    dbm.save();
    return reply(g, "Genre dibuat", 201);
  });

  add("PUT", "/api/genres/:id", (ctx) => {
    requireAdmin(ctx);
    const db = dbm.get();
    const g = db.genres.find((x) => x.id === ctx.params.id);
    if (!g) throw new HttpError(404, "Genre tidak ditemukan");
    const name = str(ctx.body.name);
    if (!name) throw bad("Nama genre wajib diisi");
    if (db.genres.some((x) => x.id !== g.id && x.name.toLowerCase() === name.toLowerCase())) throw new HttpError(409, "Genre sudah ada");
    g.name = name;
    g.description = str(ctx.body.description);
    g.updated_at = dbm.now();
    dbm.save();
    return reply(g, "Genre diperbarui");
  });

  // ----- films -----
  add("GET", "/api/films", (ctx) => {
    const db = dbm.get();
    const { p, take } = page(ctx.query, 12);
    const filter = str(ctx.query.filter).toLowerCase();
    const filterBy = str(ctx.query.filter_by) || "title";
    const genre = str(ctx.query.genre);
    let list = [...db.films];
    if (filter) {
      list = list.filter((f) => {
        if (filterBy === "director") return (f.director || "").toLowerCase().includes(filter);
        if (filterBy === "synopsis") return f.synopsis.toLowerCase().includes(filter);
        return f.title.toLowerCase().includes(filter);
      });
    }
    if (genre) {
      const ids = db.genres.filter((g) => g.id === genre || g.name.toLowerCase() === genre.toLowerCase()).map((g) => g.id);
      list = list.filter((f) => f.genre_ids.some((id) => ids.includes(id)));
    }
    list.sort((a, b) => b.created_at.localeCompare(a.created_at) || a.title.localeCompare(b.title));
    const total = list.length;
    const totalPage = Math.max(1, Math.ceil(total / take));
    const data = list.slice((p - 1) * take, p * take).map((f) => filmView(ctx, f));
    return reply(data, "OK", 200, { meta: { page: p, take, total, total_page: totalPage } });
  });

  add("GET", "/api/films/:id", (ctx) => {
    const f = dbm.get().films.find((x) => x.id === ctx.params.id);
    if (!f) throw new HttpError(404, "Film tidak ditemukan");
    return reply(filmView(ctx, f, true));
  });

  add("POST", "/api/films", (ctx) => {
    requireAdmin(ctx);
    const db = dbm.get();
    const b = ctx.body;
    const title = str(b.title);
    const synopsis = str(b.synopsis);
    if (!title) throw bad("Judul wajib diisi");
    if (synopsis.length < 10) throw bad("Sinopsis minimal 10 karakter");
    const release_date = parseDate(b.release_date);
    const airing = str(b.airing_status) || "finished_airing";
    if (!["finished_airing", "airing", "not_yet_aired"].includes(airing)) throw bad("airing_status tidak valid");
    const eps = parseInt(b.total_episodes) || 1;
    let genreIds = Array.isArray(b.genres) ? b.genres : str(b.genres).split(",").map((s) => s.trim()).filter(Boolean);
    genreIds = [...new Set(genreIds)];
    if (!genreIds.length) throw bad("Pilih minimal 1 genre");
    const unknown = genreIds.filter((id) => !db.genres.some((g) => g.id === id));
    if (unknown.length) throw bad(`Genre tidak ditemukan: ${unknown.join(", ")}`);

    const images = [];
    for (const file of ctx.files.filter((x) => x.field === "images" || x.field === "image")) {
      const ext = IMAGE_EXT[file.type];
      if (!ext) throw bad("Format gambar harus JPG, PNG, WEBP atau GIF");
      if (file.data.length > MAX_IMAGE) throw bad("Ukuran gambar maksimal 5MB");
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, name), file.data);
      images.push(name);
    }

    const film = { id: dbm.uid(), title, synopsis, director: str(b.director), release_date, airing_status: airing, total_episodes: eps, images, genre_ids: genreIds, created_at: dbm.now() };
    db.films.push(film);
    dbm.save();
    return reply(filmView(ctx, film), "Film dibuat", 201);
  });

  // ----- reviews -----
  add("POST", "/api/reviews", (ctx) => {
    const user = requireAuth(ctx);
    const db = dbm.get();
    const film_id = str(ctx.body.film_id);
    const rating = Number(ctx.body.rating);
    const comment = str(ctx.body.comment);
    if (!db.films.some((f) => f.id === film_id)) throw new HttpError(404, "Film tidak ditemukan");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw bad("Rating harus 1-5");
    if (comment.length < 5 || comment.length > 500) throw bad("Komentar harus 5-500 karakter");
    if (db.reviews.some((r) => r.film_id === film_id && r.user_id === user.id)) throw new HttpError(409, "Kamu sudah mengulas film ini");
    const r = { id: dbm.uid(), film_id, user_id: user.id, rating, comment, created_at: dbm.now() };
    db.reviews.push(r);
    dbm.save();
    return reply(reviewView(db, r), "Ulasan ditambahkan", 201);
  });

  // ----- reactions -----
  const checkStatus = (s) => {
    if (s !== "like" && s !== "dislike") throw bad("status harus 'like' atau 'dislike'");
    return s;
  };
  add("POST", "/api/reactions", (ctx) => {
    const user = requireAuth(ctx);
    const db = dbm.get();
    const review_id = str(ctx.body.review_id);
    const status = checkStatus(ctx.body.status);
    if (!db.reviews.some((r) => r.id === review_id)) throw new HttpError(404, "Ulasan tidak ditemukan");
    if (db.reactions.some((x) => x.review_id === review_id && x.user_id === user.id)) throw new HttpError(409, "Kamu sudah bereaksi, gunakan update");
    const x = { id: dbm.uid(), review_id, user_id: user.id, status, created_at: dbm.now() };
    db.reactions.push(x);
    dbm.save();
    return reply({ ...x, type: status }, "Reaksi ditambahkan", 201);
  });

  add("PUT", "/api/reactions/:id", (ctx) => {
    const user = requireAuth(ctx);
    const db = dbm.get();
    const x = db.reactions.find((r) => r.id === ctx.params.id);
    if (!x) throw new HttpError(404, "Reaksi tidak ditemukan");
    if (x.user_id !== user.id) throw new HttpError(403, "Bukan reaksi kamu");
    x.status = checkStatus(ctx.body.status);
    dbm.save();
    return reply({ ...x, type: x.status }, "Reaksi diubah");
  });

  // ----- film lists (watchlist) -----
  add("POST", "/api/film-lists", (ctx) => {
    const user = requireAuth(ctx);
    const db = dbm.get();
    const film_id = str(ctx.body.film_id);
    if (!db.films.some((f) => f.id === film_id)) throw new HttpError(404, "Film tidak ditemukan");
    if (db.film_lists.some((l) => l.film_id === film_id && l.user_id === user.id)) throw new HttpError(409, "Film sudah ada di watchlist");
    const list_status = str(ctx.body.list_status) || "watching";
    const l = { id: dbm.uid(), user_id: user.id, film_id, list_status, visibility: "private", created_at: dbm.now() };
    db.film_lists.push(l);
    dbm.save();
    return reply(listView(db, l), "Ditambahkan ke watchlist", 201);
  });

  add("PATCH", "/api/film-lists/:id", (ctx) => {
    const user = requireAuth(ctx);
    const db = dbm.get();
    const l = db.film_lists.find((x) => x.id === ctx.params.id);
    if (!l) throw new HttpError(404, "Item watchlist tidak ditemukan");
    if (l.user_id !== user.id) throw new HttpError(403, "Bukan watchlist kamu");
    if (ctx.body.visibility !== undefined) {
      if (!["public", "private"].includes(ctx.body.visibility)) throw bad("visibility harus 'public' atau 'private'");
      l.visibility = ctx.body.visibility;
    }
    if (ctx.body.list_status !== undefined) l.list_status = str(ctx.body.list_status) || l.list_status;
    dbm.save();
    return reply(listView(db, l), "Watchlist diperbarui");
  });

  // ----- users -----
  add("GET", "/api/users/:id", (ctx) => {
    const db = dbm.get();
    const u = db.users.find((x) => x.id === ctx.params.id);
    if (!u) throw new HttpError(404, "User tidak ditemukan");
    const isOwner = ctx.user?.id === u.id;
    const film_lists = db.film_lists
      .filter((l) => l.user_id === u.id && (isOwner || l.visibility === "public"))
      .map((l) => listView(db, l));
    const reviews = db.reviews.filter((r) => r.user_id === u.id);
    return reply({ ...publicUser(u), film_lists, reviews });
  });
};

module.exports.HttpError = HttpError;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
