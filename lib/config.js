"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function readConfig() {
    return JSON.parse(fs.readFileSync("config.json", "utf-8"));
}
exports.readConfig = readConfig;
