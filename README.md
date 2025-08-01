# UniFi MCP Server

[![npm version](https://badge.fury.io/js/unifi-mcp-server.svg)](https://badge.fury.io/js/unifi-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/gilberth/unifi-mcp-server/workflows/Build%20and%20Publish%20to%20NPM/badge.svg)](https://github.com/gilberth/unifi-mcp-server/actions)

Un servidor MCP (Model Context Protocol) para interactuar con controladores UniFi locales. Este servidor permite a Claude Desktop y otros clientes MCP consultar información de dispositivos, clientes, estado de salud y configuraciones de red de tu infraestructura UniFi.

## 📊 Estado del Proyecto

- ✅ **CI/CD**: GitHub Actions completamente funcional
- ✅ **Tests**: Validación en Node.js 18.x y 20.x
- ✅ **NPM**: Listo para publicación automática
- 🔄 **Última actualización**: Enero 2025 - Workflow optimizado

## 🚀 Características

- **Gestión de Dispositivos**: Lista y monitorea todos los dispositivos UniFi (Access Points, Switches, Gateways)
- **Monitoreo de Clientes**: Rastrea clientes conectados, su actividad y estadísticas de uso
- **Estado de Salud**: Obtiene métricas de salud del sistema y la red en tiempo real
- **Análisis de Red**: Realiza análisis completos de rendimiento con recomendaciones
- **Configuración de Firewall**: Gestiona reglas y grupos de firewall de forma segura
- **Configuraciones WLAN**: Administra configuraciones de redes inalámbricas
- **Métricas ISP**: Monitorea conectividad y rendimiento de internet
- **Autenticación Dual**: Soporte para UniFi OS y controladores tradicionales
- **Rate Limiting**: Protección contra sobrecarga del controlador

## 📋 Requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** o **yarn**
- **Controlador UniFi** (local o UniFi OS)
- **Acceso de administrador** al controlador UniFi
- **Red local** accesible al controlador

## 🔧 Instalación

### Opción 1: Uso temporal con npx (Recomendado para pruebas)

```bash
npx unifi-mcp-server@latest
```

### Opción 2: Instalación global

```bash
npm install -g unifi-mcp-server
```

### Opción 3: Instalación desde código fuente

1. Clona el repositorio:
```bash
git clone https://github.com/gilberth/unifi-mcp-server-ts.git
cd unifi-mcp-server-ts
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
# Configuración básica del controlador UniFi
UNIFI_HOST=192.168.1.1
UNIFI_USERNAME=admin
UNIFI_PASSWORD=tu_contraseña_segura
UNIFI_PORT=443
UNIFI_VERIFY_SSL=false
UNIFI_SITE=default

# Configuración opcional
UNIFI_API_TIMEOUT=30000
# MCP_LOG_LEVEL=debug
```

### Configuración de Claude Desktop

Para usar con Claude Desktop, agrega la siguiente configuración a tu archivo `claude_desktop_config.json`:

**Ubicación del archivo de configuración:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### Opción 1: Usando npx (Recomendado - no requiere instalación)
```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "npx",
      "args": ["unifi-mcp-server@latest"],
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña_segura",
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
        "UNIFI_PASSWORD": "tu_contraseña_segura",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

#### Opción 3: Desde código fuente (desarrollo)
```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "node",
      "args": ["/ruta/completa/al/proyecto/dist/index.js"],
      "cwd": "/ruta/completa/al/proyecto",
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña_segura",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

### Configuración de Seguridad

**⚠️ Importante para la seguridad:**

1. **Crear usuario dedicado**: Crea un usuario específico para MCP en tu controlador UniFi
2. **Permisos mínimos**: Asigna solo los permisos necesarios (lectura principalmente)
3. **Red segura**: Asegúrate de que el controlador esté en una red segura
4. **SSL/TLS**: Habilita `UNIFI_VERIFY_SSL=true` en producción si tienes certificados válidos

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
# Clonar el repositorio
git clone https://github.com/gilberth/unifi-mcp-server-ts.git
cd unifi-mcp-server-ts

# Instalar dependencias
npm install

# Copiar archivo de configuración de ejemplo
cp .env.example .env

# Editar configuración (usar tu editor preferido)
nano .env
```

### Scripts disponibles

```bash
npm run build      # Compilar TypeScript a JavaScript
npm run start      # Ejecutar la versión compilada
npm run dev        # Ejecutar en modo desarrollo con ts-node
npm test           # Ejecutar tests (cuando estén disponibles)
npm run prepare    # Compilar antes de publicar
npm run clean      # Limpiar archivos compilados
```

### Estructura del proyecto

```
unifi-mcp-server-ts/
├── src/
│   ├── index.ts           # Servidor MCP principal
│   ├── config.ts          # Gestión de configuración
│   └── unifi-client.ts    # Cliente API de UniFi
├── dist/                  # Archivos compilados
├── .env.example          # Ejemplo de configuración
├── package.json          # Configuración del paquete
├── tsconfig.json         # Configuración de TypeScript
└── README.md             # Documentación
```

## 📝 Ejemplos de Uso

### Consultas básicas con Claude Desktop

Una vez configurado, puedes hacer preguntas naturales a Claude:

#### Monitoreo general
```
"¿Cuál es el estado actual de mi red UniFi?"
"Muéstrame todos los dispositivos conectados"
"¿Hay algún problema en mi red?"
```

#### Análisis específicos
```
"Analiza el rendimiento de mi red y dame recomendaciones"
"¿Cuántos clientes están conectados por WiFi vs cable?"
"Muéstrame las estadísticas de uso de ancho de banda"
```

#### Gestión de dispositivos
```
"¿Qué dispositivos están offline?"
"Muéstrame la información del gateway principal"
"¿Cuál es el uptime de mis access points?"
```

#### Configuración de red
```
"Muéstrame todas las redes WiFi configuradas"
"¿Qué reglas de firewall tengo activas?"
"Lista todas las VLANs configuradas"
```

### Respuestas típicas

El servidor proporciona respuestas estructuradas en JSON con información detallada:

```json
{
  "total_devices": 5,
  "devices": [
    {
      "id": "60a1b2c3d4e5f6789012345",
      "mac": "aa:bb:cc:dd:ee:ff",
      "name": "Access Point Sala",
      "type": "uap",
      "status": "online",
      "ip": "192.168.1.10",
      "model": "U6-Lite",
      "version": "6.5.55.14019",
      "uptime": "168 horas"
    }
  ]
}
```

## 🔧 Solución de Problemas

### Problemas comunes

#### Error de autenticación
```
Error: Authentication failed
```
**Solución:**
- Verifica las credenciales en el archivo `.env`
- Asegúrate de que el usuario tenga permisos de administrador
- Comprueba que el controlador esté accesible en la red

#### Error de conexión SSL
```
Error: certificate verify failed
```
**Solución:**
- Establece `UNIFI_VERIFY_SSL=false` para controladores con certificados autofirmados
- O instala el certificado del controlador en el sistema

#### Timeout de conexión
```
Error: timeout of 30000ms exceeded
```
**Solución:**
- Verifica la conectividad de red al controlador
- Aumenta `UNIFI_API_TIMEOUT` en el archivo `.env`
- Comprueba que el puerto especificado esté correcto

### Logs de depuración

Para habilitar logs detallados, agrega a tu configuración:

```env
MCP_LOG_LEVEL=debug
```

### Verificación de configuración

Puedes probar la conexión manualmente:

```bash
# Desde el directorio del proyecto
npm run dev
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guías para contribuir

- Sigue las convenciones de código existentes
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que el código compile sin errores

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [`LICENSE`](LICENSE) para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. **Revisa** los [Issues existentes](https://github.com/gilberth/unifi-mcp-server-ts/issues)
2. **Crea** un nuevo Issue si no encuentras una solución
3. **Proporciona** información detallada:
   - Versión del paquete
   - Configuración del controlador UniFi
   - Logs de error completos
   - Pasos para reproducir el problema

## 🔗 Enlaces útiles

- **Repositorio GitHub**: https://github.com/gilberth/unifi-mcp-server-ts
- **Paquete npm**: https://www.npmjs.com/package/unifi-mcp-server
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **Claude Desktop**: https://claude.ai/desktop

## 🔄 Changelog

### v1.0.2 (Actual)
- ✅ Migración completa a TypeScript/Node.js
- ✅ Soporte para npx (uso temporal sin instalación)
- ✅ Autenticación dual (UniFi OS y tradicional)
- ✅ Rate limiting para protección del controlador
- ✅ Gestión completa de dispositivos y clientes
- ✅ Análisis de rendimiento con recomendaciones
- ✅ Configuración de firewall y WLAN
- ✅ Métricas ISP y monitoreo de salud
- ✅ Documentación completa y ejemplos

### Próximas versiones
- 🔄 Tests automatizados
- 🔄 Soporte para múltiples sitios
- 🔄 Métricas históricas
- 🔄 Alertas y notificaciones