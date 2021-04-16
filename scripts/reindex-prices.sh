#!/bin/env bash
set -xeuo pipefail

bin=$(mktemp)
npx esbuild  --outfile="$bin" --bundle --platform=node --target=node14 price-indexer/csv-indexer.ts
node "$bin"
