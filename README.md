# UniFi MCP Server

Un servidor MCP (Model Context Protocol) para interactuar con controladores UniFi locales. Este servidor permite a Claude Desktop y otros clientes MCP consultar información de dispositivos, clientes, estado de salud y configuraciones de red de tu infraestructura UniFi.

## 🚀 Características

- **Gestión de Dispositivos**: Lista y monitorea todos los dispositivos UniFi
- **Monitoreo de Clientes**: Rastrea clientes conectados y su actividad
- **Estado de Salud**: Obtiene métricas de salud del sistema y la red
- **Análisis de Red**: Realiza análisis completos de rendimiento
- **Configuración de Firewall**: Gestiona reglas y grupos de firewall
- **Configuraciones WLAN**: Administra configuraciones de redes inalámbricas
- **Métricas ISP**: Monitorea conectividad y rendimiento de internet

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Controlador UniFi (local o UniFi OS)
- Acceso de administrador al controlador UniFi

## 🔧 Instalación

### Opción 1: Uso temporal con npx (Recomendado)

```bash
npx unifi-mcp-server
```

### Opción 2: Instalación global

```bash
npm install -g unifi-mcp-server
```

### Opción 3: Instalación desde código fuente

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/unifi-mcp-server.git
cd unifi-mcp-server
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el proyecto:
```bash
npm run build
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en el directorio del proyecto con las siguientes variables:

```env
UNIFI_HOST=192.168.1.1
UNIFI_USERNAME=admin
UNIFI_PASSWORD=tu_contraseña
UNIFI_PORT=443
UNIFI_VERIFY_SSL=false
UNIFI_SITE=default
```

### Configuración de Claude Desktop

Para usar con Claude Desktop, agrega la siguiente configuración a tu archivo `claude_desktop_config.json`:

#### Opción 1: Usando npx (temporal)
```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "npx",
      "args": ["unifi-mcp-server"],
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

#### Opción 2: Instalación global
```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "unifi-mcp-server",
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

## 🚀 Uso

### Ejecutar el servidor directamente

```bash
# Usando npx (temporal)
npx unifi-mcp-server

# Si instalaste globalmente
unifi-mcp-server

# Desde código fuente
npm start
```

### Desarrollo

```bash
# Modo desarrollo con recarga automática
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test
```

### Herramientas Disponibles

El servidor MCP proporciona las siguientes herramientas:

#### 📱 Gestión de Dispositivos
- `list_devices` - Lista todos los dispositivos UniFi
- `get_device_health_summary` - Resumen de salud de dispositivos

#### 👥 Gestión de Clientes
- `list_clients` - Lista clientes conectados

#### 🏥 Monitoreo de Salud
- `get_system_info` - Información del sistema del controlador
- `get_health_status` - Estado de salud del sitio
- `get_isp_metrics` - Métricas de conectividad ISP

#### 📊 Análisis de Red
- `analyze_network_performance` - Análisis completo de rendimiento
- `query_isp_metrics` - Consulta métricas específicas

#### 🔥 Gestión de Firewall
- `list_firewall_rules` - Lista reglas de firewall
- `get_firewall_rule` - Obtiene regla específica
- `list_firewall_groups` - Lista grupos de firewall
- `create_firewall_rule` - Crea nueva regla de firewall

#### 📡 Configuraciones de Red
- `list_wlan_configs` - Lista configuraciones WLAN
- `list_network_configs` - Lista configuraciones de red/VLANs

## 🔒 Seguridad

- Las credenciales se manejan a través de variables de entorno
- Soporte para SSL/TLS configurable
- Autenticación automática con el controlador UniFi
- Rate limiting para prevenir sobrecarga del controlador

## 🛠️ Desarrollo

### Configuración del entorno de desarrollo

```bash
git clone https://github.com/tu-usuario/unifi-mcp-server.git
cd unifi-mcp-server
npm install
```

### Scripts disponibles

```bash
npm run build      # Compilar TypeScript a JavaScript
npm run start      # Ejecutar la versión compilada
npm run dev        # Ejecutar en modo desarrollo con ts-node
npm test           # Ejecutar tests
npm run prepare    # Compilar antes de publicar
```

## 📝 Ejemplos de Uso

### Listar todos los dispositivos
```bash
# A través de Claude Desktop, simplemente pregunta:
"¿Puedes mostrarme todos los dispositivos UniFi en mi red?"
```

### Analizar rendimiento de la red
```bash
# A través de Claude Desktop:
"Analiza el rendimiento de mi red UniFi y dame recomendaciones"
```

### Verificar estado de salud
```bash
# A través de Claude Desktop:
"¿Cuál es el estado de salud actual de mi red UniFi?"
```



## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los [Issues existentes](https://github.com/tu-usuario/unifi-mcp-server/issues)
2. Crea un nuevo Issue si no encuentras una solución
3. Proporciona información detallada sobre tu configuración y el problema

## 🔄 Changelog

### v1.0.0
- Migración completa a TypeScript/Node.js
- Soporte para npx (uso temporal sin instalación)
- Soporte completo para dispositivos UniFi
- Gestión de clientes y monitoreo de salud
- Configuración de firewall y WLAN
- Análisis de rendimiento de red