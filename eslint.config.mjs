import next from "eslint-config-next";

// eslint-config-next v16 ships a complete native flat-config array -- it already
// bundles @next/eslint-plugin-next, React, react-hooks, typescript-eslint, import,
// and jsx-a11y. We spread it as-is (no FlatCompat shim, which breaks on ESLint 9)
// and only add our ignore globs.
const config = [
  { ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"] },
  ...next,
];

export default config;
