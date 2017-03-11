export interface Config {
    auth: {
        username: string;
        password: string;
    };
    url: string;
}
export declare function readConfig(): Config;
