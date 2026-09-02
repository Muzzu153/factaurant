import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    projects: [
      // ✅ Node project = DB + integration + schema tests
      {
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: [
            'tests/schema/**/*.test.ts',
            'tests/integration/**/*.test.ts',
            'tests/**/*.test.ts', // optional if you want node as default
          ],
          exclude: ['tests/ui/**/*.test.tsx', 'tests/smoke/**/*.test.ts'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },

      // Smoke test - check if every tenant is live or not
      {
        test: {
          name: 'smoke',
          environment: 'node',
          testTimeout: 30000,
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          globals: true,
          include: ['tests/smoke/**/*.test.ts'],
          exclude: ['tests/ui/**/*.test.tsx'],
          setupFiles: ['./smoke-test.setup.ts'],
          sequence: {
            concurrent: false,
          }
        },
      },

      // JSDOM project = UI tests only
      {
        test: {
          name: 'ui',
          environment: 'jsdom',
          globals: true,
          include: ['tests/ui/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
})
