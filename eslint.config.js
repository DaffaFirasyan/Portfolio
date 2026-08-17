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
              group: [
                '**/components/reactbits',
                '**/components/reactbits/**',
                '@/components/reactbits',
                '@/components/reactbits/**',
              ],
              message:
                'Sections must not import React Bits directly. Use a primitive from src/motion/ instead (spec §3.2).',
            },
          ],
        },
      ],
    },
  },
);
