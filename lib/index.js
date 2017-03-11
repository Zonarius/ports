"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const config_1 = require("./config");
async function main() {
    const config = config_1.readConfig();
    const client = new client_1.Client(config);
    await client.login();
    console.log(JSON.stringify(await client.getForwardedPorts(), undefined, 2));
}
main().catch(errend);
function errend(err) {
    if (typeof err !== "string") {
        err = JSON.stringify(err, undefined, 2);
    }
    console.error("ERROR!", err);
    process.exitCode = 1;
}
//# sourceMappingURL=index.js.map