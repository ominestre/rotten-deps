# How to contribute to the documentation

## Structure and organization

The documentation system this is based on is https://documentation.divio.com/. This system doesn't have one thing called _documentation_, it has four: tutorials, how-to guides, technical reference, and explanations.

Technical references are generated by https://github.com/TypeStrong/typedoc based one comments within the TypeScript files themselves using the https://github.com/microsoft/tsdoc standard. You can also use https://typedoc.org/guides/options/#includes to pull these markdown files into the reference docs.

How-to, explanations, and tutorials reside as markdown files within `documentation/`. **`docs/` is the generated output for github pages and is ignored.

```
documentation
├── explanations
├── how-tos
└── tutorials
```

## Creating a new how-to, tutorial, or explanation file

### Step one

Create your new `.md` file in one of the folders mentioned above based upon your documentation type. The filename doesn't have to match the title of the doc but it should be somewhat descriptive.

### Step two

Update the `typedoc.json` configuration file. The `pages` object contains all of the configuration for embedding markdown in the generated docs.

```json
"pages": {
  "groups": [
    {
      "title": "How To",
      "pages": [
        { "title": "Contibute to the documentation", "source": "./documentation/how-to/contribute-to-docs.md" }
      ]
    }
  ],
  "output": "pages"
}
```

A `group` is a section header that the documents belong to. In the example above you can see there is a group named `How To` and it's member pages are describe below. To add your new documentation determine which group it should belong to and add a new page.

```json
"pages": [
  { "title": "My new docs", "source": "./documentation/how-to/my-new-docs.md" }
]
```

## Updating API/Reference documentation

To modify the reference documents you need to change the https://github.com/microsoft/tsdoc comments in the actual typescript source files under `src/`.

```typescript
/**
 * Creates a filereader function for fetching the contents of a config 
 * file at the provided path.
 * @param absoluteFilePath absolute path to the configuration file
 */
```

When the `tsdoc` generator runs it will pull this comment into the reference docs for that particular module. In this example we have a function description and a parameter description. The param types and returns are generated from the function definition.
 