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
export declare enum Protocol {
    ALL = 1,
    TCP = 2,
    UDP = 3,
}
export declare class Client {
    private config;
    private rq;
    private srq;
    constructor(config: Config);
    login(): Promise<void>;
    getForwardedPorts(): Promise<PortInfo[]>;
    private encryptAuth();
}
