import { defineConfig } from "vite";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import fs from "fs";

/**
 * Read all HTML Files
 */
const buildDir = "temp";

const directoriesToCopy = [
  { source: "pagefind", target: "pagefind" },
  { source: "models", target: "models" },
];

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

/**
 * Recurvice copy directory
 */
const copyDirectoryRecursive = (source, target) => {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  entries.forEach((entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
};

const input = getHtmlEntries(buildDir);

/**
 * Vite plugin to copy content files
 */
const copyFilesPlugin = () => {
  return {
    name: "copy-files-plugin",
    buildStart() {
      // xml and txt files
      processFilesInDir(buildDir, (filePath) => {
        if (filePath.endsWith(".xml") || filePath.endsWith(".txt")) {
          const targetPath = resolve("build", path.relative(buildDir, filePath));
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.copyFileSync(filePath, targetPath);
        }
      });

      // Copy directories
      directoriesToCopy.forEach(({ source, target }) => {
        const sourceDir = resolve(buildDir, source);
        const targetDir = resolve("build", target);

        if (fs.existsSync(sourceDir)) {
          copyDirectoryRecursive(sourceDir, targetDir);
          console.log(`Copied '${source}' directory to ${targetDir}`);
        } else {
          console.warn(`Source directory '${sourceDir}' does not exist.`);
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
      external: ["/pagefind/pagefind.js"],
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  plugins: [nodePolyfills(), copyFilesPlugin()],
});
