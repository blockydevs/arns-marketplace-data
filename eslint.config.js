// @ts-check

import js from '@eslint/js';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginUnicorn from 'eslint-plugin-unicorn';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  [
    globalIgnores(['dist']),
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true
        }
      },
      extends: [js.configs.recommended, tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
      plugins: {
        unicorn: pluginUnicorn
      },
      rules: {
        'no-duplicate-imports': ['error'],
        'unicorn/filename-case': ['error', { case: 'kebabCase' }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        'no-restricted-syntax': [
          'error',
          {
            selector: "ImportDeclaration[source.value='react'] > ImportDefaultSpecifier",
            message: 'React import is unnecessary since version 17'
          }
        ]
      }
    }
  ],
  [
    {
      files: ['src/__tests__/**'],
      rules: {
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off'
      }
    }
  ],
  pluginPrettierRecommended
);
