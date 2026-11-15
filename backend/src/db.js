// Penyimpanan sederhana berbasis file JSON (cukup untuk dev / demo).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { hashPassword } = require("./auth");

const FILE = process.env.DB_FILE || path.join(__dirname, "..", "data", "db.json");
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

let db;

function seed() {
  const g = (name, description) => ({ id: uid(), name, description, created_at: now(), updated_at: now() });
  const genres = [
    g("Action", "Aksi dan adegan penuh adrenalin"),
    g("Adventure", "Perjalanan dan petualangan epik"),
    g("Animation", "Film animasi"),
    g("Biography", "Kisah nyata tokoh terkenal"),
    g("Crime", "Kriminalitas dan sisi gelap masyarakat"),
    g("Drama", "Cerita emosional dengan karakter yang kuat"),
    g("Fantasy", "Dunia dan unsur imajinatif"),
    g("Horror", "Atmosfer mencekam dan menegangkan"),
    g("Music", "Cerita yang berpusat pada musik"),
    g("Sci-Fi", "Fiksi ilmiah dan teknologi masa depan"),
    g("Thriller", "Ketegangan dan teka-teki yang menahan napas"),
  ];
  const gid = (n) => genres.find((x) => x.name === n).id;
  const f = (slug, title, synopsis, director, date, eps, status, gs) => ({
    id: uid(), title, synopsis, director, release_date: date, airing_status: status,
    total_episodes: eps, images: [`seed-${slug}.png`], genre_ids: gs.map(gid), created_at: now(),
  });
  // Urutan sama dengan daftar poster; created_at dibuat berurutan agar tampil sesuai urutan ini.
  const films = [
    f("lookback", "Look Back (ルックバック)",
      "Fujino, siswi SD yang percaya diri dengan manga empat panelnya, terguncang ketika karya Kyomoto, teman sekelas yang jarang masuk sekolah, dimuat di sebelahnya. Persaingan itu berubah menjadi persahabatan dan kemitraan menggambar manga, sampai pilihan mereka di masa depan membawa keduanya ke arah yang berbeda. Adaptasi manga one-shot karya Tatsuki Fujimoto.",
      "Kiyotaka Oshiyama", "2024-06-28 00:00:00", 1, "finished_airing", ["Animation", "Drama"]),
    f("whiplash", "Whiplash",
      "Andrew Neiman, drummer jazz muda berbakat di konservatori musik bergengsi, bertekad menjadi yang terbaik. Ambisinya diuji ketika ia masuk ke ensambel Terence Fletcher, konduktor yang terkenal keras dan mendorong muridnya sampai batas fisik dan mental demi mencari kejeniusan.",
      "Damien Chazelle", "2014-10-10 00:00:00", 1, "finished_airing", ["Drama", "Music"]),
    f("resident-evil", "Resident Evil",
      "Adaptasi baru dari waralaba game survival horror Capcom, disutradarai Zach Cregger, sutradara Barbarian dan Weapons. Cerita berdiri sendiri dan menghadirkan teror baru di dunia Resident Evil dengan nuansa horor yang mencekam.",
      "Zach Cregger", "2026-09-18 00:00:00", 1, "finished_airing", ["Horror", "Action", "Thriller"]),
    f("obsession", "Obsession",
      "Seorang pemuda yang jatuh cinta pada teman dekatnya membuat permohonan yang tidak seharusnya, dan keinginan itu terkabul dengan cara yang gelap. Horor supernatural debut Curry Barker yang memadukan nuansa romansa dengan teror psikologis. \"Be careful who you wish for...\"",
      "Curry Barker", "2026-05-15 00:00:00", 1, "finished_airing", ["Horror", "Thriller"]),
    f("joker", "Joker",
      "Gotham City, awal 1980-an. Arthur Fleck, badut sewaan yang bermimpi menjadi komedian, hidup dalam kemiskinan, diabaikan masyarakat, dan merawat ibunya yang sakit. Rangkaian penghinaan dan kekerasan yang ia alami perlahan mendorongnya menjadi sosok yang dikenal sebagai Joker.",
      "Todd Phillips", "2019-10-04 00:00:00", 1, "finished_airing", ["Crime", "Drama", "Thriller"]),
    f("michael", "Michael",
      "Film biografi tentang Michael Jackson, dari awal kariernya bersama keluarga Jackson 5 hingga naik menjadi Raja Pop. Dibintangi Jaafar Jackson, keponakan Michael, dan disutradarai Antoine Fuqua dengan produser Graham King (Bohemian Rhapsody).",
      "Antoine Fuqua", "2026-04-24 00:00:00", 1, "finished_airing", ["Biography", "Drama", "Music"]),
    f("the-odyssey", "The Odyssey",
      "Adaptasi epos Homer tentang perjalanan pulang Odysseus ke Ithaca setelah Perang Troya, penuh bahaya, dewa, dan monster. Disutradarai Christopher Nolan, dibintangi Matt Damon, Tom Holland, Anne Hathaway, Robert Pattinson, Lupita Nyong'o, Zendaya, dan Charlize Theron, serta difilmkan sepenuhnya dengan kamera IMAX.",
      "Christopher Nolan", "2026-07-17 00:00:00", 1, "finished_airing", ["Adventure", "Fantasy", "Drama"]),
    f("inception", "Inception",
      "Dom Cobb adalah pencuri ulung yang mencuri rahasia dari alam bawah sadar target saat mereka bermimpi. Ia ditawari kesempatan menebus masa lalunya dengan tugas yang nyaris mustahil: bukan mencuri gagasan, melainkan menanamkannya ke pikiran seseorang. Dibintangi Leonardo DiCaprio.",
      "Christopher Nolan", "2010-07-16 00:00:00", 1, "finished_airing", ["Sci-Fi", "Action", "Thriller"]),
    f("project-hail-mary", "Project Hail Mary",
      "Seorang guru sains terbangun sendirian di pesawat antariksa, jauh dari Bumi, tanpa ingatan tentang siapa dirinya dan apa misinya. Perlahan ia sadar bahwa nasib Bumi bergantung padanya. Adaptasi novel karya Andy Weir (The Martian), dibintangi Ryan Gosling dan disutradarai Phil Lord & Christopher Miller.",
      "Phil Lord & Christopher Miller", "2026-03-20 00:00:00", 1, "finished_airing", ["Sci-Fi", "Adventure", "Drama"]),
    f("dune-part-three", "Dune: Part Three",
      "Bab penutup kisah epik Dune karya Frank Herbert, dengan Paul Atreides (Timothée Chalamet) yang kini memimpin kekaisaran, berhadapan dengan musuh-musuh lama dan baru. Disutradarai Denis Villeneuve, dibintangi Zendaya, Florence Pugh, Robert Pattinson, dan Javier Bardem. Rilis 18 Desember 2026.",
      "Denis Villeneuve", "2026-12-18 00:00:00", 1, "not_yet_aired", ["Sci-Fi", "Adventure", "Drama"]),
  ];
  // created_at menurun supaya urutan daftar (terbaru dulu) = urutan di atas
  films.forEach((film, i) => { film.created_at = new Date(Date.now() - i * 1000).toISOString(); });
  const byTitle = (t) => films.find((x) => x.title === t).id;

  const admin = { id: uid(), username: "admin", display_name: "Administrator", email: "admin@example.com", password: hashPassword("admin123"), role: "admin", created_at: now() };
  const demo = { id: uid(), username: "demo", display_name: "Demo User", email: "demo@example.com", password: hashPassword("demo123"), role: "user", created_at: now() };
  const reviews = [
    { id: uid(), film_id: byTitle("Whiplash"), user_id: demo.id, rating: 5, comment: "Intens dari awal sampai akhir, adegan drum terakhirnya luar biasa.", created_at: now() },
    { id: uid(), film_id: byTitle("Inception"), user_id: demo.id, rating: 5, comment: "Konsepnya rumit tapi seru, musiknya ikonik.", created_at: now() },
  ];
  return { users: [admin, demo], genres, films, reviews, reactions: [], film_lists: [] };
}

function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE);
}

function load() {
  if (fs.existsSync(FILE)) {
    db = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } else {
    db = seed();
    save();
    console.log("Database baru dibuat dengan data contoh:", FILE);
  }
  return db;
}

// Timpa database dengan data awal (dipakai oleh `npm run reset`)
function reset() {
  db = seed();
  save();
  return db;
}

module.exports = { load, save, reset, uid, now, get: () => db };
