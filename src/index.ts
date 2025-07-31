#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { unifiClient, UniFiDevice, UniFiClient, UniFiHealthStatus } from './unifi-client.js';

class UniFiMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'unifi-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await unifiClient.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_devices',
          description: 'Lista todos los dispositivos UniFi del sitio',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              },
              device_type: {
                type: 'string',
                description: 'Tipo de dispositivo para filtrar (uap, usw, ugw, etc.)'
              },
              status: {
                type: 'string',
                description: 'Estado para filtrar (online, offline, etc.)'
              }
            }
          }
        },
        {
          name: 'list_clients',
          description: 'Lista todos los clientes conectados al sitio',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              },
              active_only: {
                type: 'boolean',
                description: 'Solo mostrar clientes activos',
                default: true
              }
            }
          }
        },
        {
          name: 'get_system_info',
          description: 'Obtiene información del sistema del controlador',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'get_health_status',
          description: 'Obtiene el estado de salud del sitio',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'get_device_health_summary',
          description: 'Obtiene un resumen de salud de todos los dispositivos',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'get_isp_metrics',
          description: 'Obtiene métricas básicas del sitio para análisis de conectividad',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              },
              interval_hours: {
                type: 'integer',
                description: 'Horas hacia atrás para obtener datos',
                default: 1
              }
            }
          }
        },
        {
          name: 'analyze_network_performance',
          description: 'Realiza un análisis completo del rendimiento de la red',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'query_isp_metrics',
          description: 'Consulta métricas específicas del sitio UniFi',
          inputSchema: {
            type: 'object',
            properties: {
              site_name: {
                type: 'string',
                description: 'Nombre del sitio',
                default: 'default'
              },
              metric_type: {
                type: 'string',
                description: 'Tipo de métrica (device_stats, client_stats, health_stats)',
                default: 'device_stats'
              },
              time_range: {
                type: 'string',
                description: 'Rango de tiempo',
                default: '1h'
              }
            }
          }
        },
        {
          name: 'list_firewall_rules',
          description: 'Lista todas las reglas de firewall del sitio',
          inputSchema: {
            type: 'object',
            properties: {
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'get_firewall_rule',
          description: 'Obtiene una regla de firewall específica',
          inputSchema: {
            type: 'object',
            properties: {
              rule_id: {
                type: 'string',
                description: 'ID de la regla de firewall'
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['rule_id']
          }
        },
        {
          name: 'list_firewall_groups',
          description: 'Lista todos los grupos de firewall del sitio',
          inputSchema: {
            type: 'object',
            properties: {
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'create_firewall_rule',
          description: 'Crea una nueva regla de firewall',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nombre de la regla'
              },
              action: {
                type: 'string',
                description: 'Acción (accept, drop, reject)'
              },
              protocol: {
                type: 'string',
                description: 'Protocolo (tcp, udp, icmp, all)'
              },
              src_address: {
                type: 'string',
                description: 'Dirección origen'
              },
              dst_address: {
                type: 'string',
                description: 'Dirección destino'
              },
              dst_port: {
                type: 'string',
                description: 'Puerto destino (opcional)'
              },
              enabled: {
                type: 'boolean',
                description: 'Si la regla está habilitada',
                default: true
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['name', 'action', 'protocol', 'src_address', 'dst_address']
          }
        },
        {
          name: 'list_wlan_configs',
          description: 'Lista todas las configuraciones de WLAN',
          inputSchema: {
            type: 'object',
            properties: {
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            }
          }
        },
        {
          name: 'list_network_configs',
          description: 'Lista todas las configuraciones de red (VLANs, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_devices':
            return await this.listDevices(args);
          case 'list_clients':
            return await this.listClients(args);
          case 'get_system_info':
            return await this.getSystemInfo(args);
          case 'get_health_status':
            return await this.getHealthStatus(args);
          case 'get_device_health_summary':
            return await this.getDeviceHealthSummary(args);
          case 'get_isp_metrics':
            return await this.getIspMetrics(args);
          case 'analyze_network_performance':
            return await this.analyzeNetworkPerformance(args);
          case 'query_isp_metrics':
            return await this.queryIspMetrics(args);
          case 'list_firewall_rules':
            return await this.listFirewallRules(args);
          case 'get_firewall_rule':
            return await this.getFirewallRule(args);
          case 'list_firewall_groups':
            return await this.listFirewallGroups(args);
          case 'create_firewall_rule':
            return await this.createFirewallRule(args);
          case 'list_wlan_configs':
            return await this.listWlanConfigs(args);
          case 'list_network_configs':
            return await this.listNetworkConfigs(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${errorMessage}`
        );
      }
    });
  }

  private async listDevices(args: any) {
    const siteName = args?.site_name || 'default';
    const deviceType = args?.device_type;
    const status = args?.status;

    try {
      const response = await unifiClient.get(`/api/s/${siteName}/stat/device`);
      let devices: UniFiDevice[] = response.data || [];

      // Filtrar por tipo de dispositivo si se especifica
      if (deviceType) {
        devices = devices.filter(device => device.type === deviceType);
      }

      // Filtrar por estado si se especifica
      if (status) {
        const isOnline = status.toLowerCase() === 'online';
        devices = devices.filter(device => (device.state === 1) === isOnline);
      }

      const deviceSummary = devices.map(device => ({
        id: device._id,
        mac: device.mac,
        name: device.name || 'Sin nombre',
        type: device.type,
        status: device.state === 1 ? 'online' : 'offline',
        ip: device.ip,
        model: device.model,
        version: device.version,
        uptime: device.uptime ? Math.floor(device.uptime / 3600) + ' horas' : 'N/A',
        last_seen: device.last_seen ? new Date(device.last_seen * 1000).toISOString() : 'N/A'
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_devices: deviceSummary.length,
              devices: deviceSummary,
              site: siteName
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener dispositivos: ${error}`);
    }
  }

  private async listClients(args: any) {
    const siteName = args?.site_name || 'default';
    const activeOnly = args?.active_only !== false;

    try {
      const endpoint = activeOnly 
        ? `/api/s/${siteName}/stat/sta`
        : `/api/s/${siteName}/rest/user`;
      
      const response = await unifiClient.get(endpoint);
      const clients: UniFiClient[] = response.data || [];

      const clientSummary = clients.map(client => ({
        id: client._id,
        mac: client.mac,
        hostname: client.hostname || 'Sin nombre',
        ip: client.ip,
        connection_type: client.is_wired ? 'Cableado' : 'WiFi',
        last_seen: client.last_seen ? new Date(client.last_seen * 1000).toISOString() : 'N/A',
        rx_bytes: client.rx_bytes ? Math.round((client.rx_bytes / 1024 / 1024) * 100) / 100 + ' MB' : 'N/A',
        tx_bytes: client.tx_bytes ? Math.round((client.tx_bytes / 1024 / 1024) * 100) / 100 + ' MB' : 'N/A'
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_clients: clientSummary.length,
              clients: clientSummary,
              site: siteName,
              active_only: activeOnly
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error}`);
    }
  }

  private async getSystemInfo(args: any) {
    const siteName = args?.site_name || 'default';

    try {
      const response = await unifiClient.get(`/api/s/${siteName}/stat/sysinfo`);
      const sysinfo = response.data?.[0] || {};

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              system_info: {
                version: sysinfo.version,
                build: sysinfo.build,
                hostname: sysinfo.hostname,
                ip: sysinfo.ip,
                netmask: sysinfo.netmask,
                gateway: sysinfo.gateway,
                dns: sysinfo.dns,
                uptime: sysinfo.uptime ? Math.floor(sysinfo.uptime / 3600) + ' horas' : 'N/A',
                timezone: sysinfo.timezone
              },
              site: siteName
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener información del sistema: ${error}`);
    }
  }

  private async getHealthStatus(args: any) {
    const siteName = args?.site_name || 'default';

    try {
      const response = await unifiClient.get(`/api/s/${siteName}/stat/health`);
      const healthData: UniFiHealthStatus[] = response.data || [];

      const healthSummary = healthData.map(item => ({
        subsystem: item.subsystem,
        status: item.status,
        users: {
          total: item.num_user || 0,
          guest: item.num_guest || 0,
          iot: item.num_iot || 0
        }
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              health_status: healthSummary,
              site: siteName,
              overall_status: healthData.every(item => item.status === 'ok') ? 'Saludable' : 'Problemas detectados'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener estado de salud: ${error}`);
    }
  }

  private async getDeviceHealthSummary(args: any) {
    const siteName = args?.site_name || 'default';

    try {
      const [devicesResponse, healthResponse] = await Promise.all([
        unifiClient.get(`/api/s/${siteName}/stat/device`),
        unifiClient.get(`/api/s/${siteName}/stat/health`)
      ]);

      const devices: UniFiDevice[] = devicesResponse.data || [];
      const healthData: UniFiHealthStatus[] = healthResponse.data || [];

      const onlineDevices = devices.filter(d => d.state === 1).length;
      const totalDevices = devices.length;
      const offlineDevices = totalDevices - onlineDevices;

      const devicesByType = devices.reduce((acc: any, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {});

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              device_summary: {
                total: totalDevices,
                online: onlineDevices,
                offline: offlineDevices,
                uptime_percentage: totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0
              },
              devices_by_type: devicesByType,
              health_status: healthData.map(h => ({
                subsystem: h.subsystem,
                status: h.status
              })),
              site: siteName
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener resumen de salud de dispositivos: ${error}`);
    }
  }

  private async getIspMetrics(args: any) {
    const siteName = args?.site_name || 'default';
    const intervalHours = args?.interval_hours || 1;

    try {
      const [healthResponse, devicesResponse] = await Promise.all([
        unifiClient.get(`/api/s/${siteName}/stat/health`),
        unifiClient.get(`/api/s/${siteName}/stat/device`)
      ]);

      const healthData: UniFiHealthStatus[] = healthResponse.data || [];
      const devices: UniFiDevice[] = devicesResponse.data || [];

      // Buscar gateway para métricas de ISP
      const gateway = devices.find(d => d.type === 'ugw' || d.type === 'udm');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              isp_metrics: {
                gateway_status: gateway ? (gateway.state === 1 ? 'online' : 'offline') : 'no encontrado',
                gateway_model: gateway?.model || 'N/A',
                gateway_version: gateway?.version || 'N/A',
                gateway_uptime: gateway?.uptime ? Math.floor(gateway.uptime / 3600) + ' horas' : 'N/A',
                wan_health: healthData.find(h => h.subsystem === 'wan')?.status || 'unknown',
                www_health: healthData.find(h => h.subsystem === 'www')?.status || 'unknown'
              },
              interval_hours: intervalHours,
              site: siteName
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener métricas de ISP: ${error}`);
    }
  }

  private async analyzeNetworkPerformance(args: any) {
    const siteName = args?.site_name || 'default';

    try {
      const [devicesResponse, clientsResponse, healthResponse] = await Promise.all([
        unifiClient.get(`/api/s/${siteName}/stat/device`),
        unifiClient.get(`/api/s/${siteName}/stat/sta`),
        unifiClient.get(`/api/s/${siteName}/stat/health`)
      ]);

      const devices: UniFiDevice[] = devicesResponse.data || [];
      const clients: UniFiClient[] = clientsResponse.data || [];
      const healthData: UniFiHealthStatus[] = healthResponse.data || [];

      // Análisis de dispositivos
      const totalDevices = devices.length;
      const onlineDevices = devices.filter(d => d.state === 1).length;
      const deviceUptime = totalDevices > 0 ? (onlineDevices / totalDevices) * 100 : 0;

      // Análisis de clientes
      const totalClients = clients.length;
      const wiredClients = clients.filter(c => c.is_wired).length;
      const wirelessClients = totalClients - wiredClients;

      // Análisis de salud
      const healthIssues = healthData.filter(h => h.status !== 'ok');

      // Recomendaciones
      const recommendations = [];
      if (deviceUptime < 95) {
        recommendations.push('Revisar dispositivos offline para mejorar la disponibilidad de la red');
      }
      if (healthIssues.length > 0) {
        recommendations.push(`Resolver problemas de salud en: ${healthIssues.map(h => h.subsystem).join(', ')}`);
      }
      if (wirelessClients > wiredClients * 3) {
        recommendations.push('Considerar agregar más puntos de acceso para distribuir la carga WiFi');
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              network_analysis: {
                device_performance: {
                  total_devices: totalDevices,
                  online_devices: onlineDevices,
                  uptime_percentage: Math.round(deviceUptime * 100) / 100
                },
                client_distribution: {
                  total_clients: totalClients,
                  wired_clients: wiredClients,
                  wireless_clients: wirelessClients,
                  wireless_ratio: totalClients > 0 ? Math.round((wirelessClients / totalClients) * 100) : 0
                },
                health_status: {
                  total_subsystems: healthData.length,
                  healthy_subsystems: healthData.filter(h => h.status === 'ok').length,
                  issues: healthIssues.map(h => ({ subsystem: h.subsystem, status: h.status }))
                },
                recommendations: recommendations
              },
              site: siteName
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al analizar rendimiento de red: ${error}`);
    }
  }

  private async queryIspMetrics(args: any) {
    const siteName = args?.site_name || 'default';
    const metricType = args?.metric_type || 'device_stats';
    const timeRange = args?.time_range || '1h';

    try {
      let endpoint = '';
      switch (metricType) {
        case 'device_stats':
          endpoint = `/api/s/${siteName}/stat/device`;
          break;
        case 'client_stats':
          endpoint = `/api/s/${siteName}/stat/sta`;
          break;
        case 'health_stats':
          endpoint = `/api/s/${siteName}/stat/health`;
          break;
        default:
          endpoint = `/api/s/${siteName}/stat/device`;
      }

      const response = await unifiClient.get(endpoint);
      const data = response.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              metric_type: metricType,
              time_range: timeRange,
              data_points: data.length,
              data: data,
              site: siteName
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al consultar métricas: ${error}`);
    }
  }

  private async listFirewallRules(args: any) {
    const siteId = args?.site_id || 'default';

    try {
      const response = await unifiClient.get(`/api/s/${siteId}/rest/firewallrule`);
      const rules = response.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_rules: rules.length,
              rules: rules,
              site: siteId
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener reglas de firewall: ${error}`);
    }
  }

  private async getFirewallRule(args: any) {
    const ruleId = args?.rule_id;
    const siteId = args?.site_id || 'default';

    if (!ruleId) {
      throw new Error('rule_id es requerido');
    }

    try {
      const response = await unifiClient.get(`/api/s/${siteId}/rest/firewallrule/${ruleId}`);
      const rule = response.data?.[0];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              rule: rule,
              site: siteId
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener regla de firewall: ${error}`);
    }
  }

  private async listFirewallGroups(args: any) {
    const siteId = args?.site_id || 'default';

    try {
      const response = await unifiClient.get(`/api/s/${siteId}/rest/firewallgroup`);
      const groups = response.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_groups: groups.length,
              groups: groups,
              site: siteId
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener grupos de firewall: ${error}`);
    }
  }

  private async createFirewallRule(args: any) {
    const {
      name,
      action,
      protocol,
      src_address,
      dst_address,
      dst_port,
      enabled = true,
      site_id = 'default'
    } = args;

    if (!name || !action || !protocol || !src_address || !dst_address) {
      throw new Error('name, action, protocol, src_address y dst_address son requeridos');
    }

    try {
      const ruleData = {
        name,
        action,
        protocol,
        src_address,
        dst_address,
        enabled,
        ...(dst_port && { dst_port })
      };

      const response = await unifiClient.post(`/api/s/${site_id}/rest/firewallrule`, ruleData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              rule: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al crear regla de firewall: ${error}`);
    }
  }

  private async listWlanConfigs(args: any) {
    const siteId = args?.site_id || 'default';

    try {
      const response = await unifiClient.get(`/api/s/${siteId}/rest/wlanconf`);
      const wlans = response.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_wlans: wlans.length,
              wlans: wlans,
              site: siteId
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener configuraciones WLAN: ${error}`);
    }
  }

  private async listNetworkConfigs(args: any) {
    const siteId = args?.site_id || 'default';

    try {
      const response = await unifiClient.get(`/api/s/${siteId}/rest/networkconf`);
      const networks = response.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_networks: networks.length,
              networks: networks,
              site: siteId
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener configuraciones de red: ${error}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('UniFi MCP Server running on stdio');
  }
}

async function main(): Promise<void> {
  const server = new UniFiMCPServer();
  await server.run();
}

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
}

export { UniFiMCPServer, main };