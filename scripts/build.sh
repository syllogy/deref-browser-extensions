#!/bin/env bash
set -xeuo pipefail

npx esbuild --bundle --target=chrome58,firefox57 --outdir='./dist/src' --watch ./*.ts
