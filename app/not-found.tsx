import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-up">
        <p className="font-mono text-gold-400 text-sm tracking-widest mb-4">404</p>
        <h1 className="font-display text-7xl sm:text-9xl tracking-widest text-white mb-4">
          NOT<br />FOUND
        </h1>
        <p className="text-noir-500 text-sm mb-8 max-w-xs mx-auto">
          Halaman yang kamu cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/films"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 text-noir-950 font-semibold rounded-xl hover:bg-gold-300 transition-colors text-sm"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
