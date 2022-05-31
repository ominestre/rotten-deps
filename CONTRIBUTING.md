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

[How to create a release](./documentation/how-to/release.md)
