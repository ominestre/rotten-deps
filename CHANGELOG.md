## v1.0.0-beta.13
#### tech
- enables typescript strict mode and resolves any outstanding issues
- revises documentation
- updates dependencies

## v1.0.0-beta.12
#### feature
* allows CLI usage without a config file by specifying a default grace period for expiration

#### infrastructure and tooling
* converted remaining tests to typescript and dropped babel as a dev dependency since it was no longer needed
* updated dependencies

## v1.0.0-beta.11
#### feature
* adds exit codes for pass, fail, and warn to the CLI

#### minor
* adds `isStale` check for dependencies

#### infrastructure and tooling
* upped timeouts for api tests again
* configures mocha for using `.ts` files
* updates tsconfig type config to use mocha and chai types
* configures build to run prior to testing

## v1.0.0-beta.10
#### feature
* indicates in CLI report if a dependency was ignored

#### minor
* updates dependencies

## v1.0.0-beta.9
#### infrastructure
* installs `sample-app` as a pretest hook since `npm outdated` relies on your installed version

#### testing
* suppress config error table when running tests
* add unit tests for the api

## v1.0.0-beta.8
#### infrastructure
* split up github actions for yarn audit, yarn outdated, and build/test
* allows yarn outdated to fail because it constantly fails
