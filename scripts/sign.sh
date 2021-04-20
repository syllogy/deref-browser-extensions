#!/usr/bin/env bash
set -xeuo pipefail

export PATH="$PWD/node_modules/.bin:$PATH"

(
  cd ./dist
  web-ext sign --channel listed
)
