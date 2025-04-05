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
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com', // For Google profile images
      'www.gstatic.com', // For Google assets
    ],
  },
}

export default nextConfig 