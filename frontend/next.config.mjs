/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { dev }) => {
        if (dev) {
            // Prevent *.log files from triggering hot-reload loops
            config.watchOptions = {
                ...config.watchOptions,
                ignored: ['**/*.log', '**/.git/**', '**/node_modules/**'],
            };
        }
        return config;
    },
};

export default nextConfig;
