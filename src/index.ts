import { Client } from "./client";
import { Config, readConfig } from "./config";

async function main() {
    const config = readConfig();
    const client = new Client(config);

    await client.login();

    console.log(JSON.stringify(await client.getForwardedPorts(), undefined, 2));
}

main().catch(errend);

function errend(err: any) {
    if (typeof err !== "string") {
        err = JSON.stringify(err, undefined, 2);
    }
    console.error("ERROR!", err);
    process.exitCode = 1;
}
