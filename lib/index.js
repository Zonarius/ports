"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const config_1 = require("./config");
async function main() {
    const config = config_1.readConfig();
    const client = new client_1.Client(config);
    await client.login();
    client.getForwardedPorts().subscribe(log);
}
main().catch(errend);
function errend(err) {
    console.error("ERROR!", stringify(err));
    process.exitCode = 1;
}
function log(x) {
    console.log(stringify(x));
}
function stringify(x) {
    if (typeof x !== "string") {
        return JSON.stringify(x, undefined, 2);
    }
    else {
        return x;
    }
}
//# sourceMappingURL=index.js.map