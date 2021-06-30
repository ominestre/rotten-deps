## Prerequisites

1. NodeJS and preferably Node Version Manager to be able to swap between supported versions
2. Yarn

## Running locally

To run `rotten-deps` with a predefined configuration file you can:
1. Use command `yarn install` to install dependencies.
2. Use command `yarn run start`  which will build and then run `rotten-deps` using config [sample-config.json](./sample-config.json).

If you would like to have more control over the arguments and configuration used:
1. Use command `yarn install` to install dependencies
2. Use command `yarn run build` to compile and build the application
3. Use command `node ./bin/rotten-deps [args]` to run it locally. 

## Testing

Use `yarn test` to run CLI and API tests

## Submitting changes for review

When you feel like your changes are at a point where you'd like feedback, or if you feel they are ready for show time, create a pull request.
This will run the tests and other CI checks as well as signaling to the maintainers it is ready to go.

Once you've created a pull request It would be nice if you could update the [CHANGELOG.md](./CHANGELOG.md) and add a bullet about your change
to the unreleased section with a link to your pull request. See the 'Keeping a changelog' section for more details.

## Keeping a changelog

This project will use https://keepachangelog.com/en/1.0.0/ as the format for it's change log

## Release

We're investigating automating this release and publish process but for now here are the steps to generating a release.

1. Checkout branch `main` and make sure it is up to date
2. Run command `yarn install` then `yarn run build` to prep the application for deployment
3. Update [CHANGELOG.md](./CHANGELOG.md) and change the [UNRELEASED] section to reflect your next semver version (v1.0.0, v1.2.3, v2.3.4-beta001).
4. Stage the CHANGELOG.md changes in git but using command `git add CHANGELOG.md`
5. Double check that your working directory is clean other than the CHANGELOG.md change using `git status` or `git diff`. The following
command is dangerous and will add any dirty changes.
6. Use the command `npm version --force <semver>`
  * `--force` is what will include the CHANGELOG.md changes in this release commit and tag
7. Use the command `npm publish --access public` to publish

