export interface FetchRepoOpts {
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
export declare function fetchRepo(opts: FetchRepoOpts, log?: Logger): Promise<void>;
