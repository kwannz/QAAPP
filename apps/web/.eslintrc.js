module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'next',
    'next/core-web-vitals',
  ],
  rules: {
    // Keep hooks strict; relax style to warnings for incremental cleanup
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    'import/order': 'warn',
    'no-implicit-coercion': 'warn',
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1], ignoreArrayIndexes: true, ignoreDefaultValues: true, detectObjects: false }],
    'no-undefined': 'off',
    'operator-linebreak': 'warn',
    'max-len': ['warn', { code: 120, tabWidth: 2, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }],
    'comma-dangle': ['warn', 'always-multiline'],
    'react/no-array-index-key': 'warn',
    'no-console': 'warn',
  },
  ignorePatterns: ['dist/', '.next/', 'node_modules/'],
};
