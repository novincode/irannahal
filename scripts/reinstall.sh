#!/bin/bash
# Remove all package-lock.json and node_modules recursively, then run pnpm install

find . -name "package-lock.json" -type f -delete
find . -name "node_modules" -type d -exec rm -rf {} +
pnpm install
