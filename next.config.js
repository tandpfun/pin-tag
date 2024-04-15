/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  experimental: {
    esmExternals: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'bbk12e1-cdn.myschoolcdn.com',
      },
    ],
  },
};

module.exports = nextConfig;
