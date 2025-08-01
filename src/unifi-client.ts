import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as https from 'https';
import { config, UniFiConfig } from './config';

export interface UniFiDevice {
  _id: string;
  mac: string;
  type: string;
  name?: string;
  state: number;
  ip?: string;
  last_seen?: number;
  model?: string;
  version?: string;
  uptime?: number;
}

export interface UniFiClient {
  _id: string;
  mac: string;
  hostname?: string;
  ip?: string;
  is_wired: boolean;
  last_seen?: number;
  rx_bytes?: number;
  tx_bytes?: number;
}

export interface UniFiHealthStatus {
  subsystem: string;
  status: string;
  num_user?: number;
  num_guest?: number;
  num_iot?: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 100, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.requests.push(now);
  }
}

export class UniFiClientAPI {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private config: UniFiConfig;
  private isAuthenticated: boolean = false;
  private csrfToken?: string;
  private cookies: string[] = [];

  constructor(config: UniFiConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
    
    this.client = axios.create({
      baseURL: `https://${config.host}:${config.port}`,
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: config.verifySsl
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    // Interceptor para manejar cookies y respuestas
    this.client.interceptors.request.use((config) => {
      if (this.cookies.length > 0) {
        config.headers['Cookie'] = this.cookies.join('; ');
      }
      if (this.csrfToken) {
        config.headers['X-CSRF-Token'] = this.csrfToken;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        // Capturar cookies de la respuesta
        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader) {
          setCookieHeader.forEach(cookie => {
            const cookieName = cookie.split('=')[0];
            // Remover cookie existente con el mismo nombre
            this.cookies = this.cookies.filter(c => !c.startsWith(cookieName + '='));
            // Agregar nueva cookie
            this.cookies.push(cookie.split(';')[0]);
          });
        }
        
        // Capturar CSRF token
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
          this.csrfToken = csrfToken;
        }
        
        return response;
      },
      (error) => {
        console.error('UniFi API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private async authenticate(): Promise<void> {
    if (this.isAuthenticated) return;

    try {
      console.log('Intentando autenticación UniFi OS...');
      await this.authenticateUniFiOS();
      console.log('Autenticación UniFi OS exitosa');
    } catch (error) {
      console.log('UniFi OS auth failed, trying traditional auth...');
      try {
        await this.authenticateTraditional();
        console.log('Autenticación tradicional exitosa');
      } catch (traditionalError) {
        console.error('Ambas autenticaciones fallaron:', error);
        throw new Error(`Authentication failed: ${error}`);
      }
    }
  }

  private async authenticateUniFiOS(): Promise<void> {
    const loginData = {
      username: this.config.username,
      password: this.config.password,
      remember: false,
      strict: true
    };

    const response = await this.client.post('/api/auth/login', loginData);
    
    if (response.status === 200 && response.data) {
      this.isAuthenticated = true;
      console.log('UniFi OS authentication successful');
    } else {
      throw new Error('UniFi OS authentication failed');
    }
  }

  private async authenticateTraditional(): Promise<void> {
    const loginData = {
      username: this.config.username,
      password: this.config.password
    };

    const response = await this.client.post('/api/login', loginData);
    
    if (response.status === 200) {
      this.isAuthenticated = true;
    } else {
      throw new Error('Traditional authentication failed');
    }
  }

  async get(endpoint: string): Promise<any> {
    await this.rateLimiter.waitIfNeeded();
    await this.authenticate();

    try {
      const response: AxiosResponse = await this.client.get(endpoint);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.isAuthenticated = false;
        await this.authenticate();
        const response: AxiosResponse = await this.client.get(endpoint);
        return response.data;
      }
      throw error;
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    await this.rateLimiter.waitIfNeeded();
    await this.authenticate();

    try {
      const response: AxiosResponse = await this.client.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.isAuthenticated = false;
        await this.authenticate();
        const response: AxiosResponse = await this.client.post(endpoint, data);
        return response.data;
      }
      throw error;
    }
  }

  async put(endpoint: string, data: any): Promise<any> {
    await this.rateLimiter.waitIfNeeded();
    await this.authenticate();

    try {
      const response: AxiosResponse = await this.client.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.isAuthenticated = false;
        await this.authenticate();
        const response: AxiosResponse = await this.client.put(endpoint, data);
        return response.data;
      }
      throw error;
    }
  }

  async delete(endpoint: string): Promise<any> {
    await this.rateLimiter.waitIfNeeded();
    await this.authenticate();

    try {
      const response: AxiosResponse = await this.client.delete(endpoint);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.isAuthenticated = false;
        await this.authenticate();
        const response: AxiosResponse = await this.client.delete(endpoint);
        return response.data;
      }
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.isAuthenticated) {
      try {
        await this.client.post('/api/logout');
      } catch (error) {
        console.error('Error during logout:', error);
      }
      this.isAuthenticated = false;
    }
  }
}

// Instancia global del cliente con inicialización lazy
let _unifiClient: UniFiClientAPI | null = null;

export const getUnifiClient = (): UniFiClientAPI => {
  if (!_unifiClient) {
    _unifiClient = new UniFiClientAPI(config);
  }
  return _unifiClient;
};

// Mantener compatibilidad con el código existente
export const unifiClient = getUnifiClient();