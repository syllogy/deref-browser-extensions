#!/usr/bin/env bash
set -xeuo pipefail

export PATH="$PWD/node_modules/.bin:$PATH"

esbuild --bundle --target=chrome58,firefox57 --outdir='./dist/src' ./*.ts
