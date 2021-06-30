module.exports = () => ({
  testFramework: 'mocha',
  files: [
    'src/lib/*.ts',
    { pattern: 'src/bin/rotten-deps.ts', instrument: false },
    { pattern: 'test/dummies/**/*', instrument: false },
  ],
  tests: [
    'test/*.test.js',
    'test/*.test.ts',
    '!test/cli.test.ts', // Wallaby doesn't handle CLI testing well
  ],
  env: {
    type: 'node',
  },
});
