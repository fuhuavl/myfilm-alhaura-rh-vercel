"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  username: z.string().min(3, "Minimal 3 karakter").max(30, "Maksimal 30 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/register", {
        username: data.username,
        display_name: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success("Akun berhasil dibuat! Silakan login.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Registrasi gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-400/3 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-fade-up relative">
        <div className="text-center mb-10">
          <span className="font-display text-4xl tracking-widest text-gold-400">
            MYFILM
          </span>
          <p className="text-noir-500 text-sm mt-2">Buat akun baru</p>
        </div>

        <div className="bg-noir-800/60 border border-noir-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Username"
              placeholder="filmjunkie"
              error={errors.username?.message}
              {...register("username")}
            />
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
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              size="lg"
            >
              Buat Akun
            </Button>
          </form>

          <p className="text-center text-sm text-noir-500 mt-6">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
