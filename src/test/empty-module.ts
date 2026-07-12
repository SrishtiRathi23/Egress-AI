// Test-only stub. The real `server-only` package throws when it detects a client
// bundle; under Vitest there is no such distinction, so we alias it to this
// empty module (see vitest.config.ts) while keeping the guard live in the build.
export {};
