import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['src/sections/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // The bare forms (no trailing segment) cover a barrel import such as
              // `@/components/reactbits`, which the `/**` globs alone do not match.
              // Every vendored third-party directory, not just React Bits.
              // `aceternity/` was added on 2026-08-22 and the rule did not
              // cover it, which would have let a section import it directly and
              // quietly reopened the seam this rule exists to hold shut.
              group: [
                '**/components/reactbits',
                '**/components/reactbits/**',
                '@/components/reactbits',
                '@/components/reactbits/**',
                '**/components/aceternity',
                '**/components/aceternity/**',
                '@/components/aceternity',
                '@/components/aceternity/**',
              ],
              message:
                'Sections must not import vendored components directly. Use a primitive from src/motion/ instead (spec §3.2).',
            },
          ],
        },
      ],
    },
  },
);
