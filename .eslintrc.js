module.exports = {
  extends: 'airbnb-base',
  env: { node: true },
  rules: {
    'arrow-parens': 'off',
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-underscore-dangle': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'implicit-arrow-linebreak': 'off',
  },
};
