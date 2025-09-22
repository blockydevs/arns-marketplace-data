// @ts-check

/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'none',
  printWidth: 120,
  tabWidth: 2,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['^react$', '<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^[.]'],
  importOrderTypeScriptVersion: '5.8.3'
};
