import * as fs from "fs";

export interface Config {
    auth: {
        username: string;
        password: string;
    };
    url: string;
}

export function readConfig(): Config {
    return JSON.parse(fs.readFileSync("config.json", "utf-8"));
}
