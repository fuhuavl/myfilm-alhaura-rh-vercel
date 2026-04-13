import { Metadata } from "next";
import GenresClient from "./GenresClient";

export const metadata: Metadata = {
  title: "Genre Film",
  description: "Daftar semua genre film yang tersedia di MyFilm",
};

export default function GenresPage() {
  return <GenresClient />;
}
