#!/usr/bin/env bash
set -xeuo pipefail

cat styles/tailwind.css styles/main.css | NODE_ENV=production postcss -o dist/src/main.css
