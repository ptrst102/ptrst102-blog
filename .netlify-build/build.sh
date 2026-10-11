#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Netlifyの自動インストール前にpnpm自体の公開日時も検証する。
node tools/dependency-policy.mjs
corepack pnpm install --frozen-lockfile
corepack pnpm run lint
corepack pnpm test
corepack pnpm run build

# 同じAstro版でも、検証対象のコミットが公開されたことを識別する。
node --input-type=module <<'NODE'
import { mkdir, writeFile } from "node:fs/promises";
const commit = process.env.COMMIT_REF;
if (!/^[a-f0-9]{40}$/.test(commit ?? "")) {
  throw new Error("NetlifyのCOMMIT_REFを取得できません");
}
await mkdir("dist/.well-known", { recursive: true });
await writeFile("dist/.well-known/deployment.json", JSON.stringify({ commit }));
NODE
