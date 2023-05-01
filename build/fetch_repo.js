"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRepo = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const tc = __importStar(require("@actions/tool-cache"));
const exec_1 = require("@actions/exec");
const path_1 = __importDefault(require("path"));
async function fetchRepo(opts, log) {
    let binPath = opts.bin || opts.repo;
    let bin = binPath.includes("/") ? path_1.default.basename(binPath) : binPath;
    let repo = { owner: opts.owner, repo: opts.repo };
    let octokit = github.getOctokit(opts.ghToken);
    let release = await octokit.rest.repos.getReleaseByTag({ ...repo, tag: opts.version });
    let assets = await octokit.rest.repos.listReleaseAssets({
        ...repo,
        release_id: release.data.id,
    });
    let cachedDir = tc.find(bin, release.data.tag_name, process.arch);
    if (cachedDir) {
        await addToDirAndTest(cachedDir, opts, log);
        return;
    }
    let arch = constructArchPattern();
    let platform = constructPlatformPattern();
    let asset = assets.data.find((a) => arch.test(a.name) && platform.test(a.name));
    if (!asset) {
        throw new Error(`can't find release of ${opts.version}/${opts.repo} matching ${opts.version} for ${process.platform} ${process.arch}`);
    }
    core.info(`Downloading ${asset.browser_download_url}`);
    let downloadPath = await tc.downloadTool(asset.browser_download_url);
    let extractedPath = await tc.extractTar(downloadPath);
    let cacheDir = path_1.default.join(extractedPath, path_1.default.dirname(binPath));
    core.info(`Looking for binary ${cacheDir}/${bin}`);
    let cachedPath = await tc.cacheDir(cacheDir, bin, release.data.tag_name);
    await addToDirAndTest(cachedPath, opts, log);
}
exports.fetchRepo = fetchRepo;
async function addToDirAndTest(dir, opts, log) {
    core.addPath(dir);
    if (opts.test) {
        await (0, exec_1.exec)(opts.test);
    }
    log?.info(`Successfully setup ${opts.owner}/${opts.repo} ${opts.version}`);
}
function constructArchPattern() {
    switch (process.arch) {
        case "arm":
        case "arm64":
            return /arm|arm64|aarch64/i;
        case "x64":
            return /amd64|x86_64/i;
    }
    throw new Error(`Arch ${process.arch} not supported by action`);
}
function constructPlatformPattern() {
    switch (process.platform) {
        case "darwin":
            return /darwin|apple/i;
        case "linux":
            return /linux/i;
    }
    throw new Error(`OS ${process.platform} not supported by action`);
}
//# sourceMappingURL=fetch_repo.js.map