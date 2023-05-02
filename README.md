# action-install-gh-release

Use this action to install binaries from GitHub releases.

## Usage

### Examples

Add the following to your workflow to install version 0.15.1 of [lima-vm/lima](https://github.com/lima-vm/lima).

```yaml
- uses: kodeshack/action-install-gh-release@v1
  with:
    owner: lima-vm
    repo: lima
    version: 'v0.15.1'
    bin: bin/limactl
    test: limactl -v
```

Or to install version 1.13.0 of [casey/just](https://github.com/casey/just), add the following:

```yaml
- uses: kodeshack/action-install-gh-release@v1
  with:
    owner: casey
    repo: just
    version: '1.13.0'
    test: just --version
```

To prevent rate-limiting, the default Github token is automatically used when downloading from GitHub.
This can be overriden using the environment variable `GITHUB_TOKEN` or by passing a valid token to the `github-token` input.

```yaml
- uses: kodeshack/action-install-gh-release@v1
  env:
    # ...
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

or

```yaml
- uses: kodeshack/action-install-gh-release@v1
  with:
    # ...
    github-token: ${{ secrets.MY_GITHUB_TOKEN }}
```

### Inputs

| Name           | Required | Description                                                         | Type   | Default               |
| -------------- | -------- | ------------------------------------------------------------------- | ------ | --------------------- |
| `owner`        | yes      | Repository owner user or org                                                                      | string |                       |
| `repo`         | yes      | Repository name                                                                                   | string |                       |
| `version`      | yes      | Release to install                                                                                | string |                       |
| `bin`          | no       | Binary file (path) to install from the downloaded archive. Can be a template string (see below).  | string | `repo`                |
| `test`         | no       | Test command to run to test the binary, e.g. `limactl -v`                                         | string | `repo`                |
| `github-token` | no       | Github token to use to authenticate downloads/prevent rate limiting                               | string | `${{ github.token }}` |


### Templating

Some inputs can be template strings with placeholders for `version`, `platform` and `arch`.

#### Example

Given the inputs 
```yaml
owner: golangci
repo: golangci-lint
version: v1.52.2
bin: golangci-lint-{{version}}-{{platform}}-{{arch}}/golangci-lint
test: golangci-lint version
````

`bin` is a template and would be rendered as (e.g. on an ARM Mac):
`golangci-lint-v1.52.2-darwin-arm64/golangci-lint`
