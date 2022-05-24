module.exports = {
  entryPoints: ['src/lib/', 'src/bin/'],
  entryPointStrategy: 'expand',
  exclude: ['src/.eslintrc'],
  out: 'docs/',
  includeVersion: true,
  githubPages: true,
  cleanOutputDir: true,
  pluginPages: {
    source: './documentation/',
    pages: [
      {
        title: 'How To',
        children: [
          { title: 'Contribute to these docs', source: './how-to/contribute-to-docs.md' },
          { title: 'Create a config file', source: './how-to/create-a-config-file.md' },
          { title: 'Release', source: './how-to/release.md' },
        ],
      },
    ],
  },
};
