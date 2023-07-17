export interface InstallReleaseOpts {
    owner: string;
    repo: string;
    version: string;
    bin?: string;
    test?: string;
    ghToken: string;
}
export interface Logger {
    info(msg: string): void;
}
export declare function installRelease(opts: InstallReleaseOpts, log?: Logger): Promise<void>;
