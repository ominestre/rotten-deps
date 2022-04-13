# How to release a new version of Rotten Deps

1. Create a new changelog entry using semver in the title. The release version in the follow steps is pulled from the changelog version header
2. Run the command `yarn run docs` to generate the new documentation for the GitHub page
3. Run the release script using `bash scripts/release.sh`
    - Since the documentation reads the version of the `package.json` this first creates a dummy NPM version without creating a commit or tag
    - Once the dummy version is created the docs are generated
    - The docs and `CHANGELOG.md` are staged in git
    - The real `npm version` is run creating a release commit and tag
4. Push the release using `git push origin main`
5. Push the new tag using `git push --tags`
6. Login to NPM using `npm login`
7. Publish to NPM using `npm publish --access public`
