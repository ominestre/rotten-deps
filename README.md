# rotten deps

![Node.js CI](https://github.com/ominestre/rotten-deps/workflows/Node.js%20CI/badge.svg)

The command `npm outdated` only has two states, which are pass and fail. This isn't very useful for workflows which would have pass, fail, or warn. This CLI utility combines `npm outdated` and `npm view` in order to establish a compliance period for dependency checks. This way
if a dependency update is within your compliance period you can trigger a warn, or if it's beyond your compliance period it can trigger a fail.

## Installation

`npm i -g rotten-deps` or `yarn global add rotten-deps` to install this utility globally

- OR -

`npm i --save-dev rotten-deps` or `yarn add --dev rotten-deps` to install it locally in your project.

## Usage

**IMPORTANT:** you must run `npm install` or `yarn install` in your project prior to running `rotten-deps`. The `npm outdated` command relies on your local installation for determining CURRENT, WANTED, and LATEST.

### CLI

You can use `rotten-deps --help` to see the available options and command usage.

#### `---config-path <string>`

Optional: defaults to regular `npm outdated` behavior if a configuration file isn't provided.

Specifies a path to your configuration file. You can use an absolute or relative path (relative to current working directory).

#### `--json`

Optional: defaults to CLI table output

Will print the results in JSON format instead of using the CLI table.

#### `--default-expiration <number>`

Optional: default behavior is to treat any dependency not specified in the config file as being flagged as outdated immediately without a grace period.

This will set a default grace period for expiration to all dependencies not defined in the rules. If a dependency is defined within the rules that setting will take priority.

### Exit codes and meanings

* `0` indicates that no depedencies are stale or outdated
* `1` indicates that you have outdated dependencies
* `2` indicates that you have stale dependencies but no outdated

### API

Programatic usage of `rotten-deps` will be explored in the future but for now the focus is CLI. All of the functions are exported but we make no guarantees this remain stable at this time.
