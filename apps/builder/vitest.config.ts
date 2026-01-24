import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "~",
        replacement: resolve("app"),
      },
    ],
    conditions: ["webstudio", "module", "browser"],
  },
  ssr: {
    resolve: {
      conditions: ["webstudio", "module", "node"],
    },
  },
  test: {
    pool: "forks",
  },
});
