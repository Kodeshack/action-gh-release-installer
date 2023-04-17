export PATH := "./node_modules/.bin:" + env_var('PATH')

_default:
  @just --list

build:
    ncc build src/index.ts --minify --target es2015
    tsc

test: build
    ts-node src/main.test.ts

run: build
    rm -rf .tmp
    mkdir -p .tmp/cache .tmp/temp
    RUNNER_TOOL_CACHE=.tmp/cache \
    RUNNER_TEMP=.tmp/temp \
    GITHUB_TOKEN={{env_var_or_default("GITHUB_TOKEN", "")}} \
    node dist/index.js
    rm -rf .tmp

fmt:
    prettier --write src/*.ts

lint:
    eslint src/*.ts
