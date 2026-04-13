"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

function AuthInitializer() {
  const { fetchMe, token } = useAuthStore();
  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#e8e8e8",
            border: "1px solid #333",
            fontFamily: "'DM Sans', sans-serif",
          },
          success: {
            iconTheme: { primary: "#f5c842", secondary: "#0f0f0f" },
          },
          error: {
            iconTheme: { primary: "#ff4d6d", secondary: "#0f0f0f" },
          },
        }}
      />
    </QueryClientProvider>
  );
}
