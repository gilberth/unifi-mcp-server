# Configuración de Claude Desktop para UniFi MCP Server (Node.js/TypeScript)

## 🚀 Instalación y Configuración

### Opción 1: Uso Temporal con npx (Recomendado)

Esta opción no requiere instalación permanente y siempre usa la versión más reciente:

```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "npx",
      "args": ["unifi-mcp-server"],
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña_aquí",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

### Opción 2: Instalación Global

Si prefieres instalar el paquete globalmente:

1. Instalar el paquete:
```bash
npm install -g unifi-mcp-server
```

2. Configurar Claude Desktop:
```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "unifi-mcp-server",
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña_aquí",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

### Opción 3: Desarrollo Local

Para desarrollo o uso desde código fuente:

```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "node",
      "args": ["/ruta/completa/al/proyecto/dist/index.js"],
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_contraseña_aquí",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

## 🔧 Configuración de Variables de Entorno

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------||
| `UNIFI_HOST` | IP o hostname del controlador UniFi | `192.168.1.1` |
| `UNIFI_USERNAME` | Usuario administrador | `admin` |
| `UNIFI_PASSWORD` | Contraseña del usuario | `mi_contraseña_segura` |

### Variables Opcionales

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `UNIFI_PORT` | Puerto del controlador | `443` |
| `UNIFI_VERIFY_SSL` | Verificar certificados SSL | `false` |
| `UNIFI_SITE` | Sitio por defecto | `default` |

## 📍 Ubicación del Archivo de Configuración

### macOS
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Windows
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Linux
```
~/.config/Claude/claude_desktop_config.json
```

## 🔒 Configuración de Seguridad

### Para Controladores con Certificados Autofirmados

Si tu controlador UniFi usa certificados autofirmados (común en instalaciones locales):

```json
"env": {
  "UNIFI_HOST": "192.168.1.1",
  "UNIFI_USERNAME": "admin",
  "UNIFI_PASSWORD": "tu_contraseña",
  "UNIFI_PORT": "443",
  "UNIFI_VERIFY_SSL": "false",
  "UNIFI_SITE": "default"
}
```

### Para Controladores con Certificados Válidos

Si tu controlador tiene un certificado SSL válido:

```json
"env": {
  "UNIFI_HOST": "mi-controlador.ejemplo.com",
  "UNIFI_USERNAME": "admin",
  "UNIFI_PASSWORD": "tu_contraseña",
  "UNIFI_PORT": "443",
  "UNIFI_VERIFY_SSL": "true",
  "UNIFI_SITE": "default"
}
```

## 🎯 Configuración por Tipo de Controlador

### Dream Machine (UDM/UDM Pro)
```json
"env": {
  "UNIFI_HOST": "192.168.1.1",
  "UNIFI_PORT": "443",
  "UNIFI_VERIFY_SSL": "false"
}
```

### Cloud Key Gen2
```json
"env": {
  "UNIFI_HOST": "192.168.1.10",
  "UNIFI_PORT": "443",
  "UNIFI_VERIFY_SSL": "false"
}
```

### Controlador Auto-hospedado
```json
"env": {
  "UNIFI_HOST": "192.168.1.100",
  "UNIFI_PORT": "8443",
  "UNIFI_VERIFY_SSL": "false"
}
```

## ✅ Verificación de la Configuración

Después de configurar Claude Desktop:

1. **Reinicia Claude Desktop** completamente
2. **Abre una nueva conversación**
3. **Pregunta**: "¿Puedes listar mis dispositivos UniFi?"

Si la configuración es correcta, Claude debería poder acceder a tu controlador UniFi y mostrar la información de tus dispositivos.

## 🔧 Solución de Problemas

### Error: "Cannot find module 'unifi-mcp-server'"

**Solución**: Usa npx en lugar de instalación global:
```json
"command": "npx",
"args": ["unifi-mcp-server"]
```

### Error: "Connection refused"

**Posibles causas**:
- IP incorrecta del controlador
- Puerto incorrecto
- Firewall bloqueando la conexión

**Verificación**:
```bash
# Verificar conectividad
ping 192.168.1.1

# Verificar puerto
telnet 192.168.1.1 443
```

### Error: "Authentication failed"

**Posibles causas**:
- Credenciales incorrectas
- Usuario sin permisos de administrador

**Verificación**:
- Accede a la interfaz web del controlador con las mismas credenciales
- Verifica que el usuario tenga permisos de administrador

### Error: "SSL Certificate Error"

**Solución**: Desactivar verificación SSL:
```json
"UNIFI_VERIFY_SSL": "false"
```

## 🔄 Actualización

### Con npx (Automática)
No se requiere acción. npx siempre descarga la versión más reciente.

### Con Instalación Global
```bash
npm update -g unifi-mcp-server
```

## 📝 Ejemplo de Configuración Completa

```json
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "npx",
      "args": ["unifi-mcp-server"],
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "mi_contraseña_super_segura",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

## 🎉 ¡Listo!

Una vez configurado correctamente, podrás usar comandos como:

- "Lista todos mis dispositivos UniFi"
- "¿Cuántos clientes están conectados?"
- "Muestra el estado de salud de mi red"
- "Analiza el rendimiento de mi red UniFi"
- "Lista las reglas de firewall activas"

¡Disfruta de la gestión de tu red UniFi a través de Claude! 🚀