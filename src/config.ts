import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

export interface UniFiConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  verifySsl: boolean;
  site: string;
  apiKey?: string;
}

export function getUniFiConfig(): UniFiConfig {
  const config = {
    host: process.env.UNIFI_HOST || process.env.UNIFI_ROUTER_IP || 'localhost',
    username: process.env.UNIFI_USERNAME || '',
    password: process.env.UNIFI_PASSWORD || '',
    port: parseInt(process.env.UNIFI_PORT || '443'),
    verifySsl: process.env.UNIFI_VERIFY_SSL !== 'false',
    site: process.env.UNIFI_SITE || process.env.UNIFI_DEFAULT_SITE || 'default',
    apiKey: process.env.UNIFI_API_KEY
  };

  return config;
}

export const config = getUniFiConfig();