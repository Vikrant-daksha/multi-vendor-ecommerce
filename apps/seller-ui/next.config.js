//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
  images: {
    remotePatterns: [{ hostname: 'ik.imagekit.io' }],
  },
};

module.exports = nextConfig;
