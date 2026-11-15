# Film Management — Backend

Pengganti `film-management-api.labse.id` yang sudah mati. Node.js murni, **tanpa dependensi** (tidak perlu `npm install`). Data disimpan di `data/db.json` (dibuat otomatis saat pertama jalan).

## Menjalankan
```bash
cd backend
npm start          # atau: node server.js
```
Server jalan di `http://localhost:4000`, API di `http://localhost:4000/api`.

Di folder frontend, buat `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
lalu restart `npm run dev` frontend.

## Akun contoh
| Role  | Email             | Password  |
|-------|-------------------|-----------|
| admin | admin@example.com | admin123  |
| user  | demo@example.com  | demo123   |

Hapus `data/db.json` untuk mereset ke data awal.

## Konfigurasi (opsional, lihat `.env.example`)
`PORT`, `JWT_SECRET`, `PUBLIC_URL` (dipakai membentuk URL poster), `CORS_ORIGIN`.

## Endpoint
| Method | Path | Akses |
|---|---|---|
| POST | /api/auth/register | publik |
| POST | /api/auth/login | publik |
| GET | /api/auth/me | login |
| GET | /api/genres | publik |
| GET | /api/genres/admin?page&take | admin |
| POST / PUT | /api/genres, /api/genres/:id | admin |
| GET | /api/films?page&take&filter&filter_by&genre | publik |
| GET | /api/films/:id | publik (termasuk reviews & reactions) |
| POST | /api/films (multipart: title, synopsis, airing_status, total_episodes, release_date, genres, images) | admin |
| POST | /api/reviews | login |
| POST / PUT | /api/reactions, /api/reactions/:id (`status`: like/dislike) | login |
| POST / PATCH | /api/film-lists, /api/film-lists/:id (`visibility`: public/private) | login |
| GET | /api/users/:id | publik (watchlist privat hanya terlihat pemiliknya) |
| GET | /api/static/:file | gambar yang diunggah |

Catatan: login gagal mengembalikan HTTP 400 (bukan 401) karena interceptor axios di frontend me-redirect ke `/login` pada setiap 401.
