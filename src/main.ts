import * as core from "@actions/core"
import { installRelease } from "./install_release"

export async function main() {
    try {
        let owner = core.getInput("owner")
        if (!owner) {
            throw new Error("owner input must be set")
        }

        let repo = core.getInput("repo")
        if (!repo) {
            throw new Error("repo input must be set")
        }

        let version = core.getInput("version")
        if (!version) {
            throw new Error("version input must be set")
        }

        await installRelease(
            {
                owner,
                repo,
                version,
                bin: core.getInput("bin"),
                test: core.getInput("test"),
                ghToken: process.env.GITHUB_TOKEN || core.getInput("github-token"),
            },
            core
        )
    } catch (err) {
        if (err instanceof Error) {
            core.setFailed(err.message)
        }
    }
}
