#!/usr/bin/env bash
set -xeuo pipefail

./scripts/build.sh
./scripts/sign.sh
