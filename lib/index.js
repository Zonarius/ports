"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const Config = require("./config");
async function main() {
    const config = Config.readConfig();
    const jar = request.jar();
    const rq = request.defaults({
        baseUrl: config.url,
        jar
    });
    const a = await rq.get("/userRpm/LoginRpm.htm", {
        qs: Object.assign({ Save: "Save" }, config.auth)
    });
    console.log(a);
}
main().catch((err) => console.error("ERROR!", JSON.stringify(err, undefined, 2)));
