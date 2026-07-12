import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The deterministic egress engine (src/lib/egress) is held to 100% statement /
// function / line coverage -- it is the safety-critical core, so every branch that
// can execute must be exercised by a test. Branch coverage is set to 90% because a
// handful of defensive guards are deliberately hard to reach; we prove them with
// targeted malformed-input tests rather than lowering the whole bar.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/lib/egress/**/*.ts"],
      exclude: ["src/lib/egress/**/*.test.ts"],
      thresholds: {
        statements: 100,
        functions: 100,
        lines: 100,
        branches: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
