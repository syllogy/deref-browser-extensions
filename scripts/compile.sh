#!/usr/bin/env bash
set -xeuo pipefail

esbuild --bundle --target=es2018 --sourcemap --outdir='./dist/src' ./*.ts ./*.tsx

./scripts/compile-css.sh
