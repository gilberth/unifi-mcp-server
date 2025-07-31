import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export interface UniFiConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  verifySsl: boolean;
  site: string;
  apiKey?: string;
}

export const getUniFiConfig = (): UniFiConfig => {
  return {
    host: process.env.UNIFI_HOST || 'localhost',
    username: process.env.UNIFI_USERNAME || 'admin',
    password: process.env.UNIFI_PASSWORD || '',
    port: parseInt(process.env.UNIFI_PORT || '443'),
    verifySsl: process.env.UNIFI_VERIFY_SSL?.toLowerCase() === 'true',
    site: process.env.UNIFI_SITE || 'default',
    apiKey: process.env.UNIFI_API_KEY
  };
};

export const config = getUniFiConfig();