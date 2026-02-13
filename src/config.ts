import { SSF_PROD_API_URL } from './constants';

interface SdkConfig {
  baseUrl: string;
}

const config: SdkConfig = {
  baseUrl: SSF_PROD_API_URL,
};

export function configure(options: Partial<SdkConfig>): void {
  Object.assign(config, options);
}

export function getConfig(): Readonly<SdkConfig> {
  return config;
}
