"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const github_action_ts_run_api_1 = require("github-action-ts-run-api");
async function test_just(tmpdir, runnerToolCache) {
    let target = github_action_ts_run_api_1.RunTarget.mainJs("action.yml");
    let options = github_action_ts_run_api_1.RunOptions.create({
        tempDir: tmpdir,
        githubServiceEnv: {
            RUNNER_TOOL_CACHE: runnerToolCache,
        },
        fakeFsOptions: {
            tmpRootDir: tmpdir,
        },
        inputs: {
            owner: "casey",
            repo: "just",
            version: "1.13.0",
            test: "just --version",
            "github-token": process.env["GITHUB_TOKEN"],
        },
    });
    let res = await target.run(options);
    (0, assert_1.default)(res.error === undefined);
    (0, assert_1.default)(res.isSuccess);
    (0, assert_1.default)(res.exitCode !== 1);
    (0, assert_1.default)(res.commands.addedPaths.find((p) => p.includes("just")) != undefined);
    return res.stdout;
}
async function test_staticcheck(tmpdir, runnerToolCache) {
    let target = github_action_ts_run_api_1.RunTarget.mainJs("action.yml");
    let options = github_action_ts_run_api_1.RunOptions.create({
        tempDir: tmpdir,
        githubServiceEnv: {
            RUNNER_TOOL_CACHE: runnerToolCache,
        },
        fakeFsOptions: {
            tmpRootDir: tmpdir,
        },
        inputs: {
            owner: "dominikh",
            repo: "go-tools",
            version: "2023.1.3",
            bin: "staticcheck/staticcheck",
            test: "staticcheck -version",
            "github-token": process.env["GITHUB_TOKEN"],
        },
    });
    let res = await target.run(options);
    (0, assert_1.default)(res.error == undefined);
    (0, assert_1.default)(res.isSuccess);
    (0, assert_1.default)(res.exitCode !== 1);
    (0, assert_1.default)(res.commands.addedPaths.find((p) => p.includes("staticcheck")) != undefined);
    return res.stdout;
}
async function test_golangcilint(tmpdir, runnerToolCache) {
    let target = github_action_ts_run_api_1.RunTarget.mainJs("action.yml");
    let options = github_action_ts_run_api_1.RunOptions.create({
        tempDir: tmpdir,
        githubServiceEnv: {
            RUNNER_TOOL_CACHE: runnerToolCache,
        },
        fakeFsOptions: {
            tmpRootDir: tmpdir,
        },
        env: {
            GOMODCACHE: path_1.default.join(runnerToolCache, ".gomodcache"),
            GOCACHE: path_1.default.join(runnerToolCache, ".gocache"),
            GOLANGCI_LINT_CACHE: path_1.default.join(runnerToolCache, ".golangci_lint_cache"),
        },
        inputs: {
            owner: "golangci",
            repo: "golangci-lint",
            version: "v1.52.2",
            bin: "golangci-lint-1.52.2-{{platform}}-{{arch}}/golangci-lint",
            test: "golangci-lint version",
            "github-token": process.env["GITHUB_TOKEN"],
        },
    });
    let res = await target.run(options);
    (0, assert_1.default)(res.error == undefined);
    (0, assert_1.default)(res.isSuccess);
    (0, assert_1.default)(res.exitCode !== 1);
    (0, assert_1.default)(res.commands.addedPaths.find((p) => p.includes("golangci-lint")) != undefined);
    return res.stdout;
}
async function test_gitfilterrepo(tmpdir, runnerToolCache) {
    let target = github_action_ts_run_api_1.RunTarget.mainJs("action.yml");
    let options = github_action_ts_run_api_1.RunOptions.create({
        tempDir: tmpdir,
        githubServiceEnv: {
            RUNNER_TOOL_CACHE: runnerToolCache,
        },
        fakeFsOptions: {
            tmpRootDir: tmpdir,
        },
        env: {},
        inputs: {
            owner: "newren",
            repo: "git-filter-repo",
            version: "v2.38.0",
            bin: "git-filter-repo-2.38.0/git-filter-repo",
            test: "git-filter-repo --version",
            "github-token": process.env["GITHUB_TOKEN"],
        },
    });
    let res = await target.run(options);
    (0, assert_1.default)(res.error == undefined);
    (0, assert_1.default)(res.isSuccess);
    (0, assert_1.default)(res.exitCode !== 1);
    (0, assert_1.default)(res.commands.addedPaths.find((p) => p.includes("git-filter-repo")) != undefined);
    return res.stdout;
}
async function testNoCache() {
    console.log("================");
    console.log(" TEST: No Cache ");
    console.log("================");
    let tmpdir = await promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), "testnocache"));
    let runnerToolCache = path_1.default.join(tmpdir, "runner-tool-cache");
    await promises_1.default.mkdir(runnerToolCache);
    try {
        await test_just(tmpdir, runnerToolCache);
        await test_staticcheck(tmpdir, runnerToolCache);
        await test_golangcilint(tmpdir, runnerToolCache);
        let output = await test_gitfilterrepo(tmpdir, runnerToolCache);
        console.log("output", output);
    }
    finally {
        await promises_1.default.rm(tmpdir, { recursive: true });
    }
}
async function testWithCache() {
    console.log("================");
    console.log("TEST: With Cache");
    console.log("================");
    let tmpdir = await promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), "testwithcache"));
    let runnerToolCache = path_1.default.join(tmpdir, "runner-tool-cache");
    await promises_1.default.mkdir(runnerToolCache);
    try {
        await test_just(tmpdir, runnerToolCache);
        let secondRun = await test_just(tmpdir, runnerToolCache);
        (0, assert_1.default)(secondRun?.includes("Found tool in cache just 1.13.0 arm64"));
        await test_staticcheck(tmpdir, runnerToolCache);
        secondRun = await test_staticcheck(tmpdir, runnerToolCache);
        (0, assert_1.default)(secondRun?.includes("Found tool in cache staticcheck 2023.1.3 arm64"));
        await test_golangcilint(tmpdir, runnerToolCache);
        secondRun = await test_golangcilint(tmpdir, runnerToolCache);
        (0, assert_1.default)(secondRun?.includes("Found tool in cache golangci-lint 1.52.2 arm64"));
        await test_gitfilterrepo(tmpdir, runnerToolCache);
        secondRun = await test_gitfilterrepo(tmpdir, runnerToolCache);
        (0, assert_1.default)(secondRun?.includes("Found tool in cache git-filter-repo 2.38.0 arm64"));
    }
    finally {
        await promises_1.default.rm(tmpdir, { recursive: true });
    }
}
async function runTests() {
    await testNoCache();
    await testWithCache();
}
runTests();
//# sourceMappingURL=main.test.js.map