/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required to make pdfjs work
    return config;
  },
};

// Custom server configuration
module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,
    ...nextConfig,
    devIndicators: {
      autoPrerender: false,
    },
    // Port configuration for development server
    serverRuntimeConfig: {
      port: process.env.PORT || 3001
    },
    publicRuntimeConfig: {
      port: process.env.PORT || 3001
    }
  };
};
