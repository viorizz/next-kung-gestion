import type { NextConfig } from "next";
import tailwindcss from '@tailwindcss/vite'

const nextConfig: NextConfig = {
  plugins: [
    tailwindcss(),
  ],
};

export default nextConfig;
