import * as crypto from "crypto";
import * as readline from "readline";
import * as streamreq from "request";
import { RequestAPI, RequestResponse, UriOptions, UrlOptions } from "request";
import * as request from "request-promise-native";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Config } from "./config";

export interface PortInfo {
  servicePortFrom: number;
  servicePortTo: number;
  internalPortFrom: number;
  internalPortTo: number;
  ipAddress: string;
  protocol: Protocol;
  enabled: boolean;
}

export enum Protocol {
  ALL = 1,
  TCP,
  UDP
}

export class Client {
  private rq: RequestAPI<request.RequestPromise, request.RequestPromiseOptions, UriOptions>;
  private srq: streamreq.RequestAPI<streamreq.Request, streamreq.CoreOptions, streamreq.RequiredUriUrl>;
  constructor(private config: Config) { }

  public async login(): Promise<void> {
    const jar = request.jar();
    let defaults: any = {
      headers: {
        Cookie: "Authorization=Basic " + this.encryptAuth(),
        Referer: this.config.url
      },
      jar: request.jar()
    };
    this.rq = request.defaults(defaults);
    this.srq = streamreq.defaults(defaults);

    const response: string = await this.rq.get("http://192.168.0.1/userRpm/LoginRpm.htm?Save=Save");
    const matches: string[] = /href = "(.*?)Index.htm"/.exec(response);
    if (!matches) {
      throw new Error("Invalid response: " + response);
    }

    defaults = {
      baseUrl: matches[1]
    };

    this.rq = this.rq.defaults(defaults);
    this.srq = this.srq.defaults(defaults);
  }

  public getForwardedPorts(): Observable<PortInfo> {
    return Observable.create((observer: Observer<PortInfo>) => {
      const getPage = async (Page: number) => {
        this.srq.get("VirtualServerRpm.htm", { qs: { Page } }).on("response", (response) => {
          const rl = readline.createInterface({ input: response, terminal: false });

          const isStart = (line: string) => line.indexOf("var virServer") >= 0;
          const isEnd = (line: string) => line.indexOf("0,0 );") >= 0;
          let state = 0;

          rl.on("line", (line: string) => {
            switch (state) {
              case 0:
                if (isStart(line)) {
                  state = 1;
                }
                break;

              case 1:
                if (isEnd(line)) {
                  state = 2;
                } else {
                  observer.next(parsePortInfo(line));
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
                rl.close();
                if (line.indexOf("1") >= 0) {
                  getPage(Page + 1);
                } else {
                  observer.complete();
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

  private encryptAuth(): string {
    const md5 = crypto.createHash("md5");
    md5.update(this.config.auth.password);
    const pw = md5.digest("hex");
    return Buffer.from(`${this.config.auth.username}:${pw}`, "utf-8").toString("base64");
  }
}

function parsePortInfo(line: string): PortInfo {
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
};
