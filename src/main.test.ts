import os from "os"
import assert from "assert"
import path from "path"
import fs from "fs/promises"
import { RunOptions, RunTarget } from "github-action-ts-run-api"

async function test_limactl(tmpdir: string, runnerToolCache: string) {
    let target = RunTarget.mainJs("action.yml")
    let options = RunOptions.create({
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
    })

    let res = await target.run(options)

    assert(res.error == undefined)
    assert(res.isSuccess)
    assert(res.exitCode !== 1)

    assert(res.commands.addedPaths.find((p) => p.includes("lima")) != undefined)

    return res.stdout
}

async function test_just(tmpdir: string, runnerToolCache: string) {
    let target = RunTarget.mainJs("action.yml")
    let options = RunOptions.create({
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
    })

    let res = await target.run(options)

    assert(res.error === undefined)
    assert(res.isSuccess)
    assert(res.exitCode !== 1)

    assert(res.commands.addedPaths.find((p) => p.includes("just")) != undefined)

    return res.stdout
}

async function test_staticcheck(tmpdir: string, runnerToolCache: string) {
    let target = RunTarget.mainJs("action.yml")
    let options = RunOptions.create({
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
            bin: "staticcheck",
            test: "staticcheck -version",
            "github-token": process.env["GITHUB_TOKEN"],
        },
    })

    let res = await target.run(options)

    assert(res.error == undefined)
    assert(res.isSuccess)
    assert(res.exitCode !== 1)

    assert(res.commands.addedPaths.find((p) => p.includes("staticcheck")) != undefined)

    return res.stdout
}

async function testNoCache() {
    console.log("================")
    console.log(" TEST: No Cache ")
    console.log("================")

    let tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "testnocache"))
    let runnerToolCache = path.join(tmpdir, "runner-tool-cache")
    await fs.mkdir(runnerToolCache)

    try {
        await test_limactl(tmpdir, runnerToolCache)
        await test_just(tmpdir, runnerToolCache)
        await test_staticcheck(tmpdir, runnerToolCache)
    } finally {
        await fs.rm(tmpdir, { recursive: true })
    }
}

async function testWithCache() {
    console.log("================")
    console.log("TEST: With Cache")
    console.log("================")

    let tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "testwithcache"))
    let runnerToolCache = path.join(tmpdir, "runner-tool-cache")
    await fs.mkdir(runnerToolCache)

    try {
        await test_limactl(tmpdir, runnerToolCache)
        let secondRun = await test_limactl(tmpdir, runnerToolCache)
        assert(secondRun?.includes("Found tool in cache limactl 0.15.1 arm64"))

        await test_just(tmpdir, runnerToolCache)
        secondRun = await test_just(tmpdir, runnerToolCache)
        assert(secondRun?.includes("Found tool in cache just 1.13.0 arm64"))

        await test_staticcheck(tmpdir, runnerToolCache)
        secondRun = await test_staticcheck(tmpdir, runnerToolCache)
        assert(secondRun?.includes("Found tool in cache staticcheck 2023.1.3 arm64"))
    } finally {
        await fs.rm(tmpdir, { recursive: true })
    }
}

async function runTests() {
    await testNoCache()
    await testWithCache()
}

runTests()
