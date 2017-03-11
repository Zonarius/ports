import { Client } from "./client";
import { Config, readConfig } from "./config";

async function main() {
    const config = readConfig();
    const client = new Client(config);

    await client.login();

    client.getForwardedPorts().subscribe(log);
}

main().catch(errend);

function errend(err: any) {
    console.error("ERROR!", stringify(err));
    process.exitCode = 1;
}

function log(x: any) {
    console.log(stringify(x));
}

function stringify(x: any) {
    if (typeof x !== "string") {
        return JSON.stringify(x, undefined, 2);
    } else {
        return x;
    }
}
