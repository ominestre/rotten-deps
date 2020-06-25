module.exports = (wallaby) => ({
  testFramework: 'mocha',
  files: [
    'src/**/*.ts',
    { pattern: 'test/dummies/**/*', instrument: false },
  ],
  tests: [
    'test/*.test.js',
  ],
  env: {
    type: 'node',
    params: {
      runner: `-r ${require.resolve('esm')}`,
    },
  },
  compilers: {
    '**/*.js': wallaby.compilers.babel(),
  },
});
