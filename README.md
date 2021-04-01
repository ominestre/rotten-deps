# Rotten Deps

![Node.js CI](https://github.com/ominestre/rotten-deps/workflows/Node.js%20CI/badge.svg)

## What is Rotten Deps?

Rotten Deps builds upon tools like `yarn outdated` and `npm outdated` to provide more than just a pass or fail state to outdated dependecies. You can configure a global or per dependency compliance period which will trigger a warn instead of a fail. This provides more breathing room for updating without blocking your builds.

## Why and when should I use this?

### Ignoring dependencies

Sometimes cases arise where due to some tech debt or other concern you're unable to update a specific dependency. If you have `npm outdated` or `yarn outdated` in your CI flow this job will constantly fail either blocking your builds or getting the team into the habit of ignoring the output.

### Dependency specific compliance periods

Assuming you've decided that 14 days is an acceptable compliance periods for updates but you have one critical dependency that you like to keep patched. The inverse scenario also applies where maybe you're not that worried about a specific dev dependency falling out of date.

### Global compliance period

This is good for setting organization base rules if you are working in an organization that has patching compliance windows. 

## How do I use this?

### Installation

`npm i -g rotten-deps` or `yarn global add rotten-deps` to install this utility globally

- OR -

`npm i --save-dev rotten-deps` or `yarn add --dev rotten-deps` to install it locally in your project.

### Usage

You can find more in-depth documentation at https://ominestre.github.io/rotten-deps/.

#### CLI

To see details on command usage and options use `rotten-deps --help`, or if you installed it locally `node ./node_modules/.bin/rotten-deps --help`.

#### API

At this time the API isn't officially supported but you can probably figure it out based on the reference docs at https://ominestre.github.io/rotten-deps/

#### Exit codes and meanings

* `0` indicates that no depedencies are stale or outdated
* `1` indicates that you have outdated dependencies
* `2` indicates that you have stale dependencies but no outdated
