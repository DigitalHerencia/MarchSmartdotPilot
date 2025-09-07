import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "features/**/utils/**/*.test.ts",
      "features/practice/utils/**/*.test.ts",
      "lib/**/*.test.ts",
      "schemas/**/*.test.ts",
    ],
  exclude: ["e2e/**", "**/*.spec.ts", "node_modules/**", "**/dist/**"],
    globals: true,
    setupFiles: [],
    coverage: {
      reporter: ["text", "html"],
      include: ["features/**/utils/**/*.ts", "schemas/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "app/**",
        "components/**",
        "features/**/workers/**",
      ],
      thresholds: {
        lines: 0.7,
        functions: 0.7,
        statements: 0.7,
        branches: 0.7,
      },
    },
  },
});
