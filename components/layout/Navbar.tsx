"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Film, List, Shield, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Sampai jumpa!");
    router.push("/films");
    setMobileOpen(false);
  };

  const navLinks = [
    { href: "/films", label: "Films", icon: Film },
    { href: "/genres", label: "Genres", icon: List },
    ...(user ? [{ href: "/watchlist", label: "Watchlist", icon: List }] : []),
    ...(user?.role?.toUpperCase() === "ADMIN"
      ? [{ href: "/admin/genres", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-noir-700/50 bg-noir-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/films" className="flex items-center gap-2 group">
            <span className="font-display text-2xl text-gold-400 tracking-widest group-hover:text-gold-300 transition-colors">
              MYFILM
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  pathname.startsWith(href)
                    ? "text-gold-400 bg-gold-400/10"
                    : "text-noir-500 hover:text-white hover:bg-noir-800"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/users/${user.id}`}
                  className="flex items-center gap-2 text-sm text-noir-500 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center">
                    <User size={14} className="text-gold-400" />
                  </div>
                  <span className="font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-noir-500 hover:text-crimson-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-noir-500 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm bg-gold-400 text-noir-950 font-semibold rounded-md hover:bg-gold-300 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-noir-500 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-noir-700/50 bg-noir-900 animate-fade-in">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all",
                  pathname.startsWith(href)
                    ? "text-gold-400 bg-gold-400/10"
                    : "text-noir-500 hover:text-white hover:bg-noir-800"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <div className="border-t border-noir-700/50 mt-2 pt-2">
              {user ? (
                <>
                  <Link
                    href={`/users/${user.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-noir-500 hover:text-white"
                  >
                    <User size={16} />
                    {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-crimson-400 w-full"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-noir-500 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gold-400 font-semibold"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
