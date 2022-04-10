module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-restricted-syntax': ['off', 'ForOfStatement'],
    'max-len': ['warn', { code: 120 }],
  },
};
