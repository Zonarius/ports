"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const readline = require("readline");
const streamreq = require("request");
const request = require("request-promise-native");
var Protocol;
(function (Protocol) {
    Protocol[Protocol["ALL"] = 1] = "ALL";
    Protocol[Protocol["TCP"] = 2] = "TCP";
    Protocol[Protocol["UDP"] = 3] = "UDP";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
class Client {
    constructor(config) {
        this.config = config;
    }
    async login() {
        const jar = request.jar();
        let defaults = {
            headers: {
                Cookie: "Authorization=Basic " + this.encryptAuth(),
                Referer: this.config.url
            },
            jar: request.jar()
        };
        this.rq = request.defaults(defaults);
        this.srq = streamreq.defaults(defaults);
        const response = await this.rq.get("http://192.168.0.1/userRpm/LoginRpm.htm?Save=Save");
        const matches = /href = "(.*?)Index.htm"/.exec(response);
        if (!matches) {
            throw new Error("Invalid response: " + response);
        }
        defaults = {
            baseUrl: matches[1]
        };
        this.rq = this.rq.defaults(defaults);
        this.srq = this.srq.defaults(defaults);
    }
    getForwardedPorts() {
        return new Promise(async (res, rej) => {
            const portInfos = [];
            const getPage = async (Page) => {
                this.srq.get("VirtualServerRpm.htm", { qs: { Page } }).on("response", (response) => {
                    const rl = readline.createInterface({ input: response, terminal: false });
                    const isStart = (line) => line.indexOf("var virServer") >= 0;
                    const isEnd = (line) => line.indexOf("0,0 );") >= 0;
                    let state = 0;
                    rl.on("line", (line) => {
                        switch (state) {
                            case 0:
                                if (isStart(line)) {
                                    state = 1;
                                }
                                break;
                            case 1:
                                if (isEnd(line)) {
                                    state = 2;
                                }
                                else {
                                    portInfos.push(parsePortInfo(line));
                                }
                                break;
                            case 2:
                                if (isStart(line)) {
                                    state = 3;
                                }
                                break;
                            case 3:
                                state = 4;
                                break;
                            case 4:
                                state = 5;
                                if (line.indexOf("1") >= 0) {
                                    rl.close();
                                    getPage(Page + 1);
                                }
                                else {
                                    res(portInfos);
                                }
                                break;
                            default:
                                break;
                        }
                    });
                });
            };
            getPage(1);
        });
    }
    encryptAuth() {
        const md5 = crypto.createHash("md5");
        md5.update(this.config.auth.password);
        const pw = md5.digest("hex");
        return Buffer.from(`${this.config.auth.username}:${pw}`, "utf-8").toString("base64");
    }
}
exports.Client = Client;
function parsePortInfo(line) {
    const split = line.split(",");
    return {
        servicePortFrom: Number(split[0]),
        servicePortTo: Number(split[1]),
        internalPortFrom: Number(split[2]),
        internalPortTo: Number(split[3]),
        ipAddress: split[4].match(/"(.*?)"/)[1],
        protocol: Number(split[5]),
        enabled: !!Number(split[6])
    };
}
;
//# sourceMappingURL=client.js.map