import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Handle Node.js modules in browser environment
    if (!isServer) {
      try {
        const cryptoBrowserifyPath = require.resolve("crypto-browserify");

        // Add a custom plugin to intercept all node: imports before webpack tries to resolve them
        // This runs at the resolve stage, before webpack processes the module
        class NodeProtocolResolverPlugin {
          constructor(cryptoPath) {
            this.cryptoPath = cryptoPath;
            // Map of node: modules to their browser replacements or false
            this.nodeModulesMap = {
              "node:crypto": cryptoPath,
              "node:fs/promises": false,
              "node:fs": false,
              "node:path": false,
              "node:os": false,
              "node:util": false,
              "node:buffer": false,
              "node:stream": false,
              "node:events": false,
              "node:process": false,
              "node:url": false,
              "node:querystring": false,
              "node:http": false,
              "node:https": false,
              "node:zlib": false,
              "node:net": false,
              "node:tls": false,
              "node:dns": false,
              "node:readline": false,
              "node:cluster": false,
              "node:worker_threads": false,
              "node:perf_hooks": false,
              "node:async_hooks": false,
              "node:timers": false,
              "node:vm": false,
              "node:inspector": false,
              "node:trace_events": false,
              "node:path/posix": false,
              "node:path/win32": false,
              "node:constants": false,
              "node:assert": false,
              "node:assert/strict": false,
              "node:console": false,
              "node:punycode": false,
              "node:string_decoder": false,
              "node:sys": false,
              "node:timers/promises": false,
              "node:tty": false,
              "node:v8": false,
            };
          }
          apply(compiler) {
            compiler.hooks.normalModuleFactory.tap(
              "NodeProtocolResolverPlugin",
              (nmf) => {
                nmf.hooks.beforeResolve.tap(
                  "NodeProtocolResolverPlugin",
                  (data) => {
                    if (data.request && data.request.startsWith("node:")) {
                      const replacement = this.nodeModulesMap[data.request];
                      if (replacement !== undefined) {
                        if (replacement === false) {
                          // Create a fake empty module for Node.js-only modules
                          data.request = require.resolve(
                            "./node-empty-module.js"
                          );
                        } else {
                          data.request = replacement;
                        }
                      }
                    }
                  }
                );
              }
            );
          }
        }

        config.plugins.push(
          new NodeProtocolResolverPlugin(cryptoBrowserifyPath)
        );

        // Also add alias as fallback
        config.resolve.alias = {
          ...config.resolve.alias,
          "node:crypto": cryptoBrowserifyPath,
        };

        // Add NormalModuleReplacementPlugin as additional fallback for node:crypto
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^node:crypto$/,
            (resource) => {
              resource.request = cryptoBrowserifyPath;
            }
          )
        );

        // Add NormalModuleReplacementPlugin for node:fs/promises and other node: modules
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^node:fs\/promises$/,
            require.resolve("./node-empty-module.js")
          )
        );

        // Add NormalModuleReplacementPlugin for readline (direct import, not node:readline)
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^readline$/,
            require.resolve("./node-empty-module.js")
          )
        );
      } catch (e) {
        // If crypto-browserify is not available
        console.warn("Could not resolve crypto-browserify:", e.message);
        // Still set alias to false to prevent build errors
        config.resolve.alias = {
          ...config.resolve.alias,
          "node:crypto": false,
        };
      }

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: "crypto-browserify",
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        readline: false,
        "node:crypto": "crypto-browserify",
        child_process: false,
        "node:child_process": false,
        "node:fs": false,
        "node:path": false,
        "node:os": false,
        "node:util": false,
        "node:buffer": false,
        "node:stream": false,
        "node:events": false,
        "node:process": false,
        "node:url": false,
        "node:querystring": false,
        "node:http": false,
        "node:https": false,
        "node:zlib": false,
        "node:net": false,
        "node:tls": false,
        "node:dns": false,
        "node:readline": false,
        "node:cluster": false,
        "node:worker_threads": false,
        "node:perf_hooks": false,
        "node:async_hooks": false,
        "node:timers": false,
        "node:util": false,
        "node:vm": false,
        "node:inspector": false,
        "node:trace_events": false,
        "node:fs/promises": false,
        "node:path/posix": false,
        "node:path/win32": false,
        "node:os": false,
        "node:constants": false,
        "node:assert": false,
        "node:assert/strict": false,
        "node:buffer": false,
        "node:console": false,
        "node:process": false,
        "node:punycode": false,
        "node:querystring": false,
        "node:string_decoder": false,
        "node:sys": false,
        "node:timers": false,
        "node:timers/promises": false,
        "node:tty": false,
        "node:util": false,
        "node:v8": false,
        "node:vm": false,
        "node:worker_threads": false,
        "node:zlib": false,
      };
    }
    return config;
  },
};

export default nextConfig;
