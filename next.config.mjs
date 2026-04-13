/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "film-management-api.labse.id",
        pathname: "/api/static/**",
      },
    ],
  },
};

export default nextConfig;
