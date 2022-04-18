## v1.0.1

### Dependencies

- Updated several dev dependencies which finally clears up the `eslint-plugin-import` vulnerabilities failing the audit pipeline
- Updated `yargs` 17.4.0 -> 17.4.1
  - This addresses several bugs that I don't believe have an impact on this project

## v1.0.0

🎉 With the hem and haw of the CHANGELOG all of the previous betas weren't done in a way to nicely rollup for the v1.0.0 release notes. So instead here is a nice list of the features I'm launching this with:

### API

- Everything is organized so that you can directly import `rotten-deps` and use it for programmatic report generation. You can also import the individual libraries for processing config and interacting with NPM but this isn't officially supported at this moment.

### CLI

- You can set a default expiration via the CLI flag `--default-expiration`
- You can output raw JSON instead of a table using the `--json` flag
- By default you get a nice table display

### Exit codes for CI

As mentioned in the main `README.md` the project uses exit codes to differentiate between a success (no outdated), a warn (some outdated but within compliance windows), and a fail (something is outdated beyond compliance window).

### Configuration

- You can flat out ignore a dependency from the check using the `ignore` property of a rule
- You can give a dependency it's own compliance window separate from  the default expiration
- You can provide a reason for the whitelist to help you remember why you whitelisted it in the first place (e.g. Depends on Bootstrap v1.2.3 upgrade)

## v1.0.0-beta.26

### Enhancement

- Enables using `--default-expiration` CLI flag alongside a config file. In the case of it being specified in both locations the CLI flag value takes precedence. [change](https://github.com/ominestre/rotten-deps/pull/83)
- Adds `reason` property to the rules for making notes on why you whitelisted a dependency [change](https://github.com/ominestre/rotten-deps/pull/84)

### Documentation

- Replaces unmaintained typedoc pages plugin [change](https://github.com/ominestre/rotten-deps/pull/82)
- Revises the release and config docs. The config docs were missing a property and the formatting was changed for better readability at a glance. [change](https://github.com/ominestre/rotten-deps/pull/80)

### Chores

- Replaces `cli-table` with `cli-table3` since the former is no longer maintained

## 1.0.0-beta.25

### Enhancements

- Adds "days allowed" to the report generator and CLI table which represents either the default config or one for the specific rule. This is to help visualize how a dependency was determined to be outdated. [change](https://github.com/ominestre/rotten-deps/pull/78)
- Refactored the report generator so that the requests for package details are now done in parallel instead of sequentially [change](https://github.com/ominestre/rotten-deps/pull/64)
- Upgraded to Yargs `v17.x` which drops support for Node `v10.x`. Node `v10.x` will no longer be tested
and supported by this project [change](https://github.com/ominestre/rotten-deps/pull/55)

### Fixes

- Fixed days outdated being calculated incorrectly [change](https://github.com/ominestre/rotten-deps/pull/61)

### Chores

- Patches Lodash to address command injection in Lodash templates [change](https://github.com/ominestre/rotten-deps/pull/55)
- Patches developer dependencies [change](https://github.com/ominestre/rotten-deps/pull/55)
- Patches many many more dependencies after a hiatus from the project (didn't keep track of all the PRs)
- Added testing support for Node 16.x
- Dropped support for Node 10.x

### Documentation

- Added docs on contributing to the project [change](https://github.com/ominestre/rotten-deps/pull/58/)
- Added docs on how the days outdated are determined [change](https://github.com/ominestre/rotten-deps/pull/61)
- Changed the format of `CHANGELOG.md` again [change](https://github.com/ominestre/rotten-deps/pull/58/)
- Fixed typos and linting issues in all of the projects documentation [change](https://github.com/ominestre/rotten-deps/pull/75)

## 1.0.0-beta.24

- BUG: [Issue #3](https://github.com/ominestre/rotten-deps/issues/3) Fixes issue with generating report before installed 
- OPS: Configures CI to fail on outdated
- TOOLS: Creates a script for handling releases
- DOCS: Revises the module header TSDoc

## 1.0.0-beta.23

- DOCS: rebuilds README.md
- DOCS: Adds documentation for creating a config file
- DOCS/TOOLS: Patches `typedoc-plugin-pages` to fix inconsistency with the latest version of `typescript` and `typedoc`
- MINOR: Adds tast to preserve `.nojekyll` after running a docs clean task

## v1.0.0-beta.22

- Started drinking our own flavor-aide. Replaced `yarn outdated` with `rotten-deps`
- Updated dependencies

## v1.0.0-beta.21

### feature

- adds optional progress bar to report generation using CLI flag `--progress`

## v1.0.0-beta.19

### documentation

- fixes 404 github pages by disabling jekyll

## v1.0.0-beta.18

### documentation

- makes `docs/` the equivalent to `docs/generated/` since that's where GitHub pages looks
- created `documentation/` for the actual user created markdown files

## v1.0.0-beta.17

### documentation

- adds tsdoc for generation of reference docs
- adds tsdoc-pages for inclusion of markdown files in generated reference docs

## v1.0.0-beta.16

### tech

- fixes issue where `config` and `npm-interactions` libraries were not being included in the NPM publish

## v1.0.0-beta.15

### documentation

- [@synth3tk](https://github.com/synth3tk) added unit of measurement for clarity on grace period docs

## v1.0.0-beta.14

### documentation

- fixed incorrect package name in readme

## v1.0.0-beta.13

### tech

- enables typescript strict mode and resolves any outstanding issues
- revises documentation
- updates dependencies

## v1.0.0-beta.12
### feature

- allows CLI usage without a config file by specifying a default grace period for expiration

### infrastructure and tooling

- converted remaining tests to typescript and dropped babel as a dev dependency since it was no longer needed
- updated dependencies

## v1.0.0-beta.11

### feature

- adds exit codes for pass, fail, and warn to the CLI

### minor

- adds `isStale` check for dependencies

### infrastructure and tooling

- upped timeouts for api tests again
- configures mocha for using `.ts` files
- updates tsconfig type config to use mocha and chai types
- configures build to run prior to testing

## v1.0.0-beta.10

### feature

- indicates in CLI report if a dependency was ignored

### minor

- updates dependencies

## v1.0.0-beta.9
### infrastructure

- installs `sample-app` as a pretest hook since `npm outdated` relies on your installed version

### testing

- suppress config error table when running tests
- add unit tests for the api

## v1.0.0-beta.8
### infrastructure

- split up github actions for yarn audit, yarn outdated, and build/test
- allows yarn outdated to fail because it constantly fails
