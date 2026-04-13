"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/films";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {

      const res = await api.post("/auth/login", data);
      const payload = res.data.data ?? res.data;
      const { token, role } = payload;

      // Fetch user data setelah dapat token
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const meRes = await api.get("/auth/me");
      const user = meRes.data.data?.personal_info ?? meRes.data.data ?? meRes.data;
      setAuth(user, token);
      toast.success(`Selamat datang, ${user.username ?? user.display_name}!`);
      router.push(redirect);
  
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-400/3 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-fade-up relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-display text-4xl tracking-widest text-gold-400">
            MYFILM
          </span>
          <p className="text-noir-500 text-sm mt-2">Masuk ke akun kamu</p>
        </div>

        <div className="bg-noir-800/60 border border-noir-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="kamu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              size="lg"
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-noir-500 mt-6">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
