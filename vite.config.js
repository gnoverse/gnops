import { defineConfig } from "vite";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import fs from "fs";

/**
 * Read all HTML Files
 */
const buildDir = "dist";

/**
 * Common function to process files in a directory
 */
const processFilesInDir = (dir, callback) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processFilesInDir(filePath, callback);
    } else if (stat.isFile()) {
      callback(filePath);
    }
  });
};

/**
 * Get HTML entries
 */
const getHtmlEntries = (dir) => {
  const entries = {};
  processFilesInDir(dir, (filePath) => {
    if (filePath.endsWith(".html")) {
      const name = path.relative(buildDir, filePath).replace(/\\/g, "/").replace(".html", "");
      entries[name] = filePath;
    }
  });
  return entries;
};

const input = getHtmlEntries(buildDir);

/**
 * Vite plugin to copy XML and TXT files
 */
const copyFilesPlugin = () => {
  return {
    name: "copy-files-plugin",
    buildStart() {
      processFilesInDir(buildDir, (filePath) => {
        if (filePath.endsWith(".xml") || filePath.endsWith(".txt")) {
          const targetPath = resolve("build", path.relative(buildDir, filePath));
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.copyFileSync(filePath, targetPath);
        }
      });
    },
  };
};

export default defineConfig({
  root: buildDir,

  watch: {
    include: ["static/**"],
  },
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    outDir: resolve(__dirname, "build"),
    rollupOptions: {
      input,
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  plugins: [nodePolyfills(), copyFilesPlugin()],
});
