#!/usr/bin/bash

version=`head -n 1 CHANGELOG.md | cut -c4-`

echo "creating v$version"

npm version --no-git-tag-version $version
npm run docs
git add docs/ CHANGELOG.md
npm version -f --allow-same-version $version
