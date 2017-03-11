import * as request from "request-promise-native";
import * as Config from "./config";

async function main() {
    const config = Config.readConfig();
    const jar = request.jar();

    const rq = request.defaults({
        baseUrl: config.url,
        jar
    });

    const a = await rq.get("/userRpm/LoginRpm.htm", {
        qs: {
            Save: "Save",
            ...config.auth
        }
    });
    console.log(a);
}

main().catch((err) => console.error("ERROR!", JSON.stringify(err, undefined, 2)));
