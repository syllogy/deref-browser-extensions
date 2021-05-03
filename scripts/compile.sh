#!/usr/bin/env bash
set -xeuo pipefail

esbuild --bundle --target=firefox86,chrome88 --sourcemap --outdir='./dist/src' ./*.ts ./*.tsx

./scripts/compile-css.sh
