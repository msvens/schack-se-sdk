interface SdkConfig {
    baseUrl: string;
    /** Default request timeout in milliseconds, applied when a service or call
     *  doesn't specify its own. */
    timeoutMs: number;
}
export declare function configure(options: Partial<SdkConfig>): void;
export declare function getConfig(): Readonly<SdkConfig>;
export {};
//# sourceMappingURL=config.d.ts.map