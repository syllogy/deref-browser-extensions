#!/bin/env bash
set -xeuo pipefail

# This tells shellcheck to ignore the warning about the trap evaluating now
# rather than when caught.
# shellcheck disable=SC2064
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

(cd dist && web-ext run --verbose --target=chromium) &
esbuild --bundle --target=chrome58,firefox57 --outdir='./dist/src' ./*.ts --watch &

wait
