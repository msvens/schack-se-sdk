import { SSF_PROD_API_URL, DEFAULT_TIMEOUT } from './constants';

interface SdkConfig {
  baseUrl: string;
  /** Default request timeout in milliseconds, applied when a service or call
   *  doesn't specify its own. */
  timeoutMs: number;
}

const config: SdkConfig = {
  baseUrl: SSF_PROD_API_URL,
  timeoutMs: DEFAULT_TIMEOUT,
};

export function configure(options: Partial<SdkConfig>): void {
  Object.assign(config, options);
}

export function getConfig(): Readonly<SdkConfig> {
  return config;
}
