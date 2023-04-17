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
async function test_limactl(tmpdir, runnerToolCache) {
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
            owner: "lima-vm",
            repo: "lima",
            version: "v0.15.1",
            bin: "bin/limactl",
            test: "limactl -v",
            "github-token": process.env["GITHUB_TOKEN"],
        },
    });
    let res = await target.run(options);
    (0, assert_1.default)(res.error == undefined);
    (0, assert_1.default)(res.isSuccess);
    (0, assert_1.default)(res.exitCode !== 1);
    (0, assert_1.default)(res.commands.addedPaths.find((p) => p.includes("lima")) != undefined);
    return res.stdout;
}
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
async function testNoCache() {
    console.log("================");
    console.log(" TEST: No Cache ");
    console.log("================");
    let tmpdir = await promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), "testnocache"));
    let runnerToolCache = path_1.default.join(tmpdir, "runner-tool-cache");
    await promises_1.default.mkdir(runnerToolCache);
    try {
        await test_limactl(tmpdir, runnerToolCache);
        await test_just(tmpdir, runnerToolCache);
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
        await test_limactl(tmpdir, runnerToolCache);
        let secondRun = await test_limactl(tmpdir, runnerToolCache);
        (0, assert_1.default)(secondRun?.includes("Found tool in cache limactl 0.15.1 arm64"));
        await test_just(tmpdir, runnerToolCache);
        secondRun = await test_just(tmpdir, runnerToolCache);
        (0, assert_1.default)(secondRun?.includes("Found tool in cache just 1.13.0 arm64"));
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