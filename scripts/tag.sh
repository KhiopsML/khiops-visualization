#!/usr/bin/env bash

set -e

git pull origin main --tags

if [ $# -ne 1 ]; then
    echo "Usage: $0 <tag>"
    exit 1
fi

TAG=$1

# Replace version into package.json
if [ "$(uname -s)" = "Darwin" ]; then
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$TAG\"/" package.json
else
    sed -i "s/\"version\": \".*\"/\"version\": \"$TAG\"/" package.json
fi

git add .
git commit -am "$TAG"
git tag -s v$TAG -m "$TAG"
git push origin main --tags


# exit 0
$SHELL