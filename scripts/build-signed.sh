#!/usr/bin/env bash
set -xeuo pipefail

./scripts/compile.sh
(
  cd ./dist
  web-ext sign --channel listed
)
