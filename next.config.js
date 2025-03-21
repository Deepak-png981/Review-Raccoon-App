// @ts-check

/**
 * @type {import('next').NextConfig}
 */
export const nextConfig = {
  reactStrictMode: true,
  // // Add TypeScript checking
  // typescript: {
  //   // Dangerously ignore build errors (only during debugging)
  //   ignoreBuildErrors: false,
  // },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

export default nextConfig 