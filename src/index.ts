#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { getUnifiClient, UniFiDevice, UniFiClient, UniFiHealthStatus } from './unifi-client.js';
import { getUniFiConfig } from './config.js';

class UniFiMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'unifi-mcp-server',
        version: '1.1.0',
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
      await getUnifiClient().close();
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
        },
        // QoS Management
        {
          name: 'unifi_create_qos_rule',
          description: 'Crea una nueva regla de QoS para control de ancho de banda',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nombre de la regla QoS'
              },
              enabled: {
                type: 'boolean',
                description: 'Si la regla está habilitada',
                default: true
              },
              download_limit: {
                type: 'number',
                description: 'Límite de descarga en Kbps'
              },
              upload_limit: {
                type: 'number',
                description: 'Límite de subida en Kbps'
              },
              target_type: {
                type: 'string',
                description: 'Tipo de objetivo (client, network, device)',
                default: 'client'
              },
              target_value: {
                type: 'string',
                description: 'Valor del objetivo (MAC, IP, CIDR)'
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['name', 'download_limit', 'upload_limit', 'target_value']
          }
        },
        {
          name: 'unifi_toggle_qos_rule_enabled',
          description: 'Habilita o deshabilita una regla de QoS existente',
          inputSchema: {
            type: 'object',
            properties: {
              rule_id: {
                type: 'string',
                description: 'ID de la regla QoS'
              },
              enabled: {
                type: 'boolean',
                description: 'Estado deseado de la regla'
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['rule_id', 'enabled']
          }
        },
        // VPN Management
        {
          name: 'unifi_list_vpn_clients',
          description: 'Lista todos los clientes VPN configurados',
          inputSchema: {
            type: 'object',
            properties: {
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              },
              active_only: {
                type: 'boolean',
                description: 'Solo mostrar clientes VPN activos',
                default: false
              }
            }
          }
        },
        {
          name: 'unifi_update_vpn_client_state',
          description: 'Actualiza el estado de un cliente VPN (habilitar/deshabilitar)',
          inputSchema: {
            type: 'object',
            properties: {
              client_id: {
                type: 'string',
                description: 'ID del cliente VPN'
              },
              enabled: {
                type: 'boolean',
                description: 'Estado deseado del cliente VPN'
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['client_id', 'enabled']
          }
        },
        // Port Forwarding
        {
          name: 'unifi_list_port_forwards',
          description: 'Lista todas las reglas de port forwarding configuradas',
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
          name: 'unifi_create_port_forward',
          description: 'Crea una nueva regla de port forwarding',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nombre de la regla de port forwarding'
              },
              enabled: {
                type: 'boolean',
                description: 'Si la regla está habilitada',
                default: true
              },
              src_port: {
                type: 'string',
                description: 'Puerto origen (externo)'
              },
              dst_port: {
                type: 'string',
                description: 'Puerto destino (interno)'
              },
              dst_ip: {
                type: 'string',
                description: 'IP destino interna'
              },
              protocol: {
                type: 'string',
                description: 'Protocolo (tcp, udp, tcp_udp)',
                default: 'tcp'
              },
              log: {
                type: 'boolean',
                description: 'Habilitar logging',
                default: false
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['name', 'src_port', 'dst_port', 'dst_ip']
          }
        },
        {
          name: 'unifi_toggle_port_forward',
          description: 'Habilita o deshabilita una regla de port forwarding',
          inputSchema: {
            type: 'object',
            properties: {
              rule_id: {
                type: 'string',
                description: 'ID de la regla de port forwarding'
              },
              enabled: {
                type: 'boolean',
                description: 'Estado deseado de la regla'
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['rule_id', 'enabled']
          }
        },
        // Traffic Routes
        {
          name: 'unifi_create_traffic_route',
          description: 'Crea una nueva ruta de tráfico estática',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nombre de la ruta'
              },
              enabled: {
                type: 'boolean',
                description: 'Si la ruta está habilitada',
                default: true
              },
              destination_network: {
                type: 'string',
                description: 'Red de destino (CIDR)'
              },
              gateway_ip: {
                type: 'string',
                description: 'IP del gateway'
              },
              interface: {
                type: 'string',
                description: 'Interfaz de red (opcional)'
              },
              metric: {
                type: 'number',
                description: 'Métrica de la ruta',
                default: 1
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['name', 'destination_network', 'gateway_ip']
          }
        },
        {
          name: 'unifi_update_traffic_route',
          description: 'Actualiza una ruta de tráfico existente',
          inputSchema: {
            type: 'object',
            properties: {
              route_id: {
                type: 'string',
                description: 'ID de la ruta'
              },
              name: {
                type: 'string',
                description: 'Nuevo nombre de la ruta'
              },
              enabled: {
                type: 'boolean',
                description: 'Estado de la ruta'
              },
              destination_network: {
                type: 'string',
                description: 'Nueva red de destino (CIDR)'
              },
              gateway_ip: {
                type: 'string',
                description: 'Nueva IP del gateway'
              },
              metric: {
                type: 'number',
                description: 'Nueva métrica de la ruta'
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['route_id']
          }
        },
        // Advanced Firewall
        {
          name: 'unifi_create_firewall_policy',
          description: 'Crea una nueva política de firewall avanzada',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nombre de la política'
              },
              enabled: {
                type: 'boolean',
                description: 'Si la política está habilitada',
                default: true
              },
              action: {
                type: 'string',
                description: 'Acción (accept, drop, reject)',
                default: 'accept'
              },
              protocol: {
                type: 'string',
                description: 'Protocolo (tcp, udp, icmp, all)',
                default: 'all'
              },
              src_zone: {
                type: 'string',
                description: 'Zona origen'
              },
              dst_zone: {
                type: 'string',
                description: 'Zona destino'
              },
              src_address_group: {
                type: 'string',
                description: 'Grupo de direcciones origen'
              },
              dst_address_group: {
                type: 'string',
                description: 'Grupo de direcciones destino'
              },
              dst_port_group: {
                type: 'string',
                description: 'Grupo de puertos destino'
              },
              logging: {
                type: 'boolean',
                description: 'Habilitar logging',
                default: false
              },
              site_id: {
                type: 'string',
                description: 'ID del sitio',
                default: 'default'
              }
            },
            required: ['name', 'action']
          }
        },
        {
          name: 'unifi_list_firewall_zones',
          description: 'Lista todas las zonas de firewall configuradas',
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
          // QoS Management
          case 'unifi_create_qos_rule':
            return await this.createQosRule(args);
          case 'unifi_toggle_qos_rule_enabled':
            return await this.toggleQosRule(args);
          // VPN Management
          case 'unifi_list_vpn_clients':
            return await this.listVpnClients(args);
          case 'unifi_update_vpn_client_state':
            return await this.updateVpnClientState(args);
          // Port Forwarding
          case 'unifi_list_port_forwards':
            return await this.listPortForwards(args);
          case 'unifi_create_port_forward':
            return await this.createPortForward(args);
          case 'unifi_toggle_port_forward':
            return await this.togglePortForward(args);
          // Traffic Routes
          case 'unifi_create_traffic_route':
            return await this.createTrafficRoute(args);
          case 'unifi_update_traffic_route':
            return await this.updateTrafficRoute(args);
          // Advanced Firewall
          case 'unifi_create_firewall_policy':
            return await this.createFirewallPolicy(args);
          case 'unifi_list_firewall_zones':
            return await this.listFirewallZones(args);
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
      const client = getUnifiClient();
      const response = await client.get(`/proxy/network/api/s/${siteName}/stat/device`);
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
        ? `/proxy/network/api/s/${siteName}/stat/sta`
        : `/proxy/network/api/s/${siteName}/rest/user`;
      
      const response = await getUnifiClient().get(endpoint);
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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/sysinfo`);
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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/health`);
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
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/device`),
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/health`)
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
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/health`),
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/device`)
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
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/device`),
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/sta`),
        getUnifiClient().get(`/proxy/network/api/s/${siteName}/stat/health`)
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
          endpoint = `/proxy/network/api/s/${siteName}/stat/device`;
          break;
        case 'client_stats':
          endpoint = `/proxy/network/api/s/${siteName}/stat/sta`;
          break;
        case 'health_stats':
          endpoint = `/proxy/network/api/s/${siteName}/stat/health`;
          break;
        default:
          endpoint = `/proxy/network/api/s/${siteName}/stat/device`;
      }

      const response = await getUnifiClient().get(endpoint);
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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteId}/rest/firewallrule`);
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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteId}/rest/firewallrule/${ruleId}`);
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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteId}/rest/firewallgroup`);
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

      const response = await getUnifiClient().post(`/proxy/network/api/s/${site_id}/rest/firewallrule`, ruleData);

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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteId}/rest/wlanconf`);
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
      const response = await getUnifiClient().get(`/proxy/network/api/s/${siteId}/rest/networkconf`);
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

  // QoS Management Methods
  private async createQosRule(args: any) {
    const {
      name,
      enabled = true,
      download_limit,
      upload_limit,
      target_type = 'client',
      target_value,
      site_id = 'default'
    } = args;

    if (!name || !download_limit || !upload_limit || !target_value) {
      throw new Error('name, download_limit, upload_limit y target_value son requeridos');
    }

    try {
      const qosData = {
        name,
        enabled,
        download_limit_kbps: download_limit,
        upload_limit_kbps: upload_limit,
        target_type,
        target_value
      };

      const response = await getUnifiClient().post(`/proxy/network/api/s/${site_id}/rest/qosrule`, qosData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Regla QoS '${name}' creada exitosamente`,
              rule: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al crear regla QoS: ${error}`);
    }
  }

  private async toggleQosRule(args: any) {
    const { rule_id, enabled, site_id = 'default' } = args;

    if (!rule_id || enabled === undefined) {
      throw new Error('rule_id y enabled son requeridos');
    }

    try {
      const updateData = { enabled };
      const response = await getUnifiClient().put(`/proxy/network/api/s/${site_id}/rest/qosrule/${rule_id}`, updateData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Regla QoS ${enabled ? 'habilitada' : 'deshabilitada'} exitosamente`,
              rule: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al actualizar regla QoS: ${error}`);
    }
  }

  // VPN Management Methods
  private async listVpnClients(args: any) {
    const { site_id = 'default', active_only = false } = args;

    try {
      const response = await getUnifiClient().get(`/proxy/network/api/s/${site_id}/rest/vpnclient`);
      let vpnClients = response.data || [];

      if (active_only) {
        vpnClients = vpnClients.filter((client: any) => client.enabled && client.connected);
      }

      const clientSummary = vpnClients.map((client: any) => ({
        id: client._id,
        name: client.name,
        enabled: client.enabled,
        connected: client.connected || false,
        type: client.type,
        server: client.server,
        username: client.username,
        last_connected: client.last_connected ? new Date(client.last_connected * 1000).toISOString() : 'Nunca'
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_vpn_clients: clientSummary.length,
              active_clients: clientSummary.filter((c: any) => c.connected).length,
              clients: clientSummary,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener clientes VPN: ${error}`);
    }
  }

  private async updateVpnClientState(args: any) {
    const { client_id, enabled, site_id = 'default' } = args;

    if (!client_id || enabled === undefined) {
      throw new Error('client_id y enabled son requeridos');
    }

    try {
      const updateData = { enabled };
      const response = await getUnifiClient().put(`/proxy/network/api/s/${site_id}/rest/vpnclient/${client_id}`, updateData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Cliente VPN ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
              client: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al actualizar cliente VPN: ${error}`);
    }
  }

  // Port Forwarding Methods
  private async listPortForwards(args: any) {
    const { site_id = 'default' } = args;

    try {
      const response = await getUnifiClient().get(`/proxy/network/api/s/${site_id}/rest/portforward`);
      const portForwards = response.data || [];

      const portForwardSummary = portForwards.map((rule: any) => ({
        id: rule._id,
        name: rule.name,
        enabled: rule.enabled,
        src_port: rule.fwd_port,
        dst_port: rule.fwd_port_to,
        dst_ip: rule.fwd_ip,
        protocol: rule.proto,
        src: rule.src,
        dst: rule.dst,
        log: rule.log || false,
        created: rule.date_created ? new Date(rule.date_created * 1000).toISOString() : 'N/A'
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_rules: portForwardSummary.length,
              active_rules: portForwardSummary.filter((rule: any) => rule.enabled).length,
              rules: portForwardSummary,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener reglas de port forwarding: ${error}`);
    }
  }

  private async createPortForward(args: any) {
    const {
      name,
      enabled = true,
      src_port,
      dst_port,
      dst_ip,
      protocol = 'tcp',
      log = false,
      site_id = 'default'
    } = args;

    if (!name || !src_port || !dst_port || !dst_ip) {
      throw new Error('name, src_port, dst_port y dst_ip son requeridos');
    }

    try {
      const portForwardData = {
        name,
        enabled,
        src: 'wan',
        dst: 'lan',
        fwd_port: src_port,
        fwd_ip: dst_ip,
        fwd_port_to: dst_port,
        proto: protocol,
        log
      };

      const response = await getUnifiClient().post(`/proxy/network/api/s/${site_id}/rest/portforward`, portForwardData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Regla de port forwarding '${name}' creada exitosamente`,
              rule: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al crear regla de port forwarding: ${error}`);
    }
  }

  private async togglePortForward(args: any) {
    const { rule_id, enabled, site_id = 'default' } = args;

    if (!rule_id || enabled === undefined) {
      throw new Error('rule_id y enabled son requeridos');
    }

    try {
      const updateData = { enabled };
      const response = await getUnifiClient().put(`/proxy/network/api/s/${site_id}/rest/portforward/${rule_id}`, updateData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Regla de port forwarding ${enabled ? 'habilitada' : 'deshabilitada'} exitosamente`,
              rule: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al actualizar regla de port forwarding: ${error}`);
    }
  }

  // Traffic Routes Methods
  private async createTrafficRoute(args: any) {
    const {
      name,
      enabled = true,
      destination_network,
      gateway_ip,
      interface: iface,
      metric = 1,
      site_id = 'default'
    } = args;

    if (!name || !destination_network || !gateway_ip) {
      throw new Error('name, destination_network y gateway_ip son requeridos');
    }

    try {
      const routeData = {
        name,
        enabled,
        static_route_network: destination_network,
        static_route_nexthop: gateway_ip,
        static_route_distance: metric,
        ...(iface && { static_route_interface: iface })
      };

      const response = await getUnifiClient().post(`/proxy/network/api/s/${site_id}/rest/routing`, routeData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Ruta de tráfico '${name}' creada exitosamente`,
              route: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al crear ruta de tráfico: ${error}`);
    }
  }

  private async updateTrafficRoute(args: any) {
    const {
      route_id,
      name,
      enabled,
      destination_network,
      gateway_ip,
      metric,
      site_id = 'default'
    } = args;

    if (!route_id) {
      throw new Error('route_id es requerido');
    }

    try {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (enabled !== undefined) updateData.enabled = enabled;
      if (destination_network !== undefined) updateData.static_route_network = destination_network;
      if (gateway_ip !== undefined) updateData.static_route_nexthop = gateway_ip;
      if (metric !== undefined) updateData.static_route_distance = metric;

      const response = await getUnifiClient().put(`/proxy/network/api/s/${site_id}/rest/routing/${route_id}`, updateData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Ruta de tráfico actualizada exitosamente',
              route: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al actualizar ruta de tráfico: ${error}`);
    }
  }

  // Advanced Firewall Methods
  private async createFirewallPolicy(args: any) {
    const {
      name,
      enabled = true,
      action = 'accept',
      protocol = 'all',
      src_zone,
      dst_zone,
      src_address_group,
      dst_address_group,
      dst_port_group,
      logging = false,
      site_id = 'default'
    } = args;

    if (!name || !action) {
      throw new Error('name y action son requeridos');
    }

    try {
      const policyData = {
        name,
        enabled,
        action,
        protocol,
        logging,
        ...(src_zone && { src_zone }),
        ...(dst_zone && { dst_zone }),
        ...(src_address_group && { src_address_group }),
        ...(dst_address_group && { dst_address_group }),
        ...(dst_port_group && { dst_port_group })
      };

      const response = await getUnifiClient().post(`/proxy/network/api/s/${site_id}/rest/firewallpolicy`, policyData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Política de firewall '${name}' creada exitosamente`,
              policy: response.data,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al crear política de firewall: ${error}`);
    }
  }

  private async listFirewallZones(args: any) {
    const { site_id = 'default' } = args;

    try {
      const response = await getUnifiClient().get(`/proxy/network/api/s/${site_id}/rest/firewallzone`);
      const zones = response.data || [];

      const zoneSummary = zones.map((zone: any) => ({
        id: zone._id,
        name: zone.name,
        enabled: zone.enabled,
        interfaces: zone.interfaces || [],
        networks: zone.networks || []
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_zones: zoneSummary.length,
              zones: zoneSummary,
              site: site_id
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al obtener zonas de firewall: ${error}`);
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