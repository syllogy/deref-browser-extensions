#!/usr/bin/env bash
set -xeuo pipefail

esbuild --bundle --target=chrome58,firefox57 --outdir='./dist/src' ./*.ts ./*.tsx
