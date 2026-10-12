#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Netlifyの自動インストール前にpnpm自体の公開日時も検証する。
node tools/dependency-policy.mjs
corepack pnpm install --frozen-lockfile
corepack pnpm run lint
corepack pnpm run build
