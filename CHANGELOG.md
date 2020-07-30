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
