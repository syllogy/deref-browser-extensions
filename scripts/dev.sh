#!/usr/bin/env bash
set -xeuo pipefail

# This tells shellcheck to ignore the warning about the trap evaluating now
# rather than when caught.
# shellcheck disable=SC2064
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

# Use local AWS CLI config to find a convenient login url.
account_id="$(aws sts get-caller-identity --query 'Account' --output text)"
if [[ -z "$account_id" ]]; then
  start_url="https://signin.aws.amazon.com/console"
else
  start_url="https://${account_id}.signin.aws.amazon.com/console"
fi

(cd dist && web-ext run --verbose "--start-url=$start_url") &
esbuild --bundle --target=firefox86,chrome88 --outdir='./dist/src' ./*.ts ./*.tsx --watch &

wait
