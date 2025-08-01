# Funcionalidades Avanzadas - UniFi MCP Server v1.1.0

## 🚀 Nuevas Funcionalidades Agregadas

### 📊 QoS Avanzado
Control de calidad de servicio para optimizar el ancho de banda de la red.

#### `unifi_create_qos_rule`
Crea una nueva regla de QoS para controlar el ancho de banda.

**Parámetros:**
- `name` (string, requerido): Nombre de la regla QoS
- `enabled` (boolean, opcional): Si la regla está habilitada (default: true)
- `download_limit` (number, requerido): Límite de descarga en kbps
- `upload_limit` (number, requerido): Límite de subida en kbps
- `target_type` (string, opcional): Tipo de objetivo (default: 'client')
- `target_value` (string, requerido): Valor del objetivo (MAC, IP, etc.)
- `site_id` (string, opcional): ID del sitio (default: 'default')

**Ejemplo:**
```json
{
  "name": "Limite Gaming",
  "download_limit": 50000,
  "upload_limit": 10000,
  "target_value": "aa:bb:cc:dd:ee:ff"
}
```

#### `unifi_toggle_qos_rule_enabled`
Habilita o deshabilita una regla QoS existente.

**Parámetros:**
- `rule_id` (string, requerido): ID de la regla QoS
- `enabled` (boolean, requerido): Estado de la regla
- `site_id` (string, opcional): ID del sitio (default: 'default')

---

### 🔐 VPN Completo
Gestión completa de clientes VPN para acceso remoto seguro.

#### `unifi_list_vpn_clients`
Lista todos los clientes VPN configurados.

**Parámetros:**
- `site_id` (string, opcional): ID del sitio (default: 'default')
- `active_only` (boolean, opcional): Solo clientes activos (default: false)

#### `unifi_update_vpn_client_state`
Actualiza el estado de un cliente VPN.

**Parámetros:**
- `client_id` (string, requerido): ID del cliente VPN
- `enabled` (boolean, requerido): Estado del cliente
- `site_id` (string, opcional): ID del sitio (default: 'default')

---

### 🌐 Port Forwarding
Configuración de reenvío de puertos para servicios externos.

#### `unifi_create_port_forward`
Crea una nueva regla de port forwarding.

**Parámetros:**
- `name` (string, requerido): Nombre de la regla
- `enabled` (boolean, opcional): Si la regla está habilitada (default: true)
- `src_port` (number, requerido): Puerto origen (externo)
- `dst_port` (number, requerido): Puerto destino (interno)
- `dst_ip` (string, requerido): IP destino interna
- `protocol` (string, opcional): Protocolo (tcp/udp, default: 'tcp')
- `log` (boolean, opcional): Habilitar logging (default: false)
- `site_id` (string, opcional): ID del sitio (default: 'default')

**Ejemplo:**
```json
{
  "name": "Web Server",
  "src_port": 80,
  "dst_port": 8080,
  "dst_ip": "192.168.1.100",
  "protocol": "tcp"
}
```

#### `unifi_toggle_port_forward`
Habilita o deshabilita una regla de port forwarding.

**Parámetros:**
- `rule_id` (string, requerido): ID de la regla
- `enabled` (boolean, requerido): Estado de la regla
- `site_id` (string, opcional): ID del sitio (default: 'default')

---

### 🛣️ Traffic Routes
Gestión de rutas de tráfico para enrutamiento avanzado.

#### `unifi_create_traffic_route`
Crea una nueva ruta de tráfico estática.

**Parámetros:**
- `name` (string, requerido): Nombre de la ruta
- `enabled` (boolean, opcional): Si la ruta está habilitada (default: true)
- `destination_network` (string, requerido): Red de destino (CIDR)
- `gateway_ip` (string, requerido): IP del gateway
- `interface` (string, opcional): Interfaz específica
- `metric` (number, opcional): Métrica de la ruta (default: 1)
- `site_id` (string, opcional): ID del sitio (default: 'default')

**Ejemplo:**
```json
{
  "name": "Ruta VPN",
  "destination_network": "10.0.0.0/24",
  "gateway_ip": "192.168.1.1",
  "metric": 10
}
```

#### `unifi_update_traffic_route`
Actualiza una ruta de tráfico existente.

**Parámetros:**
- `route_id` (string, requerido): ID de la ruta
- `name` (string, opcional): Nuevo nombre
- `enabled` (boolean, opcional): Estado de la ruta
- `destination_network` (string, opcional): Nueva red de destino
- `gateway_ip` (string, opcional): Nuevo gateway
- `metric` (number, opcional): Nueva métrica
- `site_id` (string, opcional): ID del sitio (default: 'default')

---

### 🛡️ Firewall Avanzado
Gestión avanzada de políticas y zonas de firewall.

#### `unifi_create_firewall_policy`
Crea una nueva política de firewall avanzada.

**Parámetros:**
- `name` (string, requerido): Nombre de la política
- `enabled` (boolean, opcional): Si la política está habilitada (default: true)
- `action` (string, opcional): Acción (accept/drop/reject, default: 'accept')
- `protocol` (string, opcional): Protocolo (default: 'all')
- `src_zone` (string, opcional): Zona origen
- `dst_zone` (string, opcional): Zona destino
- `src_address_group` (string, opcional): Grupo de direcciones origen
- `dst_address_group` (string, opcional): Grupo de direcciones destino
- `dst_port_group` (string, opcional): Grupo de puertos destino
- `logging` (boolean, opcional): Habilitar logging (default: false)
- `site_id` (string, opcional): ID del sitio (default: 'default')

#### `unifi_list_firewall_zones`
Lista todas las zonas de firewall configuradas.

**Parámetros:**
- `site_id` (string, opcional): ID del sitio (default: 'default')

---

## 🔧 Instalación y Uso

### Actualización desde versión anterior
```bash
npm update unifi-mcp-server
```

### Uso con Trae IDE
Las nuevas funcionalidades están disponibles automáticamente en tu configuración MCP existente. No se requiere configuración adicional.

### Ejemplos de Uso Práctico

#### Configurar QoS para Gaming
```json
{
  "tool": "unifi_create_qos_rule",
  "arguments": {
    "name": "Gaming Priority",
    "download_limit": 100000,
    "upload_limit": 50000,
    "target_value": "gaming-device-mac"
  }
}
```

#### Configurar Port Forwarding para Servidor Web
```json
{
  "tool": "unifi_create_port_forward",
  "arguments": {
    "name": "Web Server HTTPS",
    "src_port": 443,
    "dst_port": 443,
    "dst_ip": "192.168.1.100",
    "protocol": "tcp"
  }
}
```

#### Crear Ruta VPN
```json
{
  "tool": "unifi_create_traffic_route",
  "arguments": {
    "name": "Office VPN Route",
    "destination_network": "10.10.0.0/16",
    "gateway_ip": "192.168.1.254"
  }
}
```

---

## 📋 Notas Importantes

1. **Permisos**: Asegúrate de que tu usuario UniFi tenga permisos administrativos
2. **Backup**: Siempre haz backup de tu configuración antes de hacer cambios importantes
3. **Testing**: Prueba las reglas en un entorno de desarrollo antes de aplicarlas en producción
4. **Monitoreo**: Usa las herramientas de análisis incluidas para monitorear el impacto de los cambios

---

## 🐛 Solución de Problemas

### Error de Autenticación
- Verifica las credenciales en tu archivo `.env`
- Asegúrate de que el usuario tenga permisos administrativos

### Reglas no Aplicadas
- Verifica que el `site_id` sea correcto
- Confirma que los parámetros requeridos estén presentes
- Revisa los logs del controlador UniFi

### Problemas de Conectividad
- Verifica la conectividad de red al controlador
- Confirma que el puerto y SSL estén configurados correctamente

---

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, por favor crea un issue en el repositorio del proyecto.