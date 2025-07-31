# Configuración de ejemplo para Claude Desktop después de instalar desde PyPI

## Instalación desde PyPI
```bash
pip install unifi-mcp-server
```

## Configuración en Claude Desktop

Después de instalar el paquete, actualiza tu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unifi-site-manager": {
      "command": "unifi-mcp-server",
      "env": {
        "UNIFI_HOST": "192.168.1.1",
        "UNIFI_USERNAME": "admin",
        "UNIFI_PASSWORD": "tu_password",
        "UNIFI_PORT": "443",
        "UNIFI_VERIFY_SSL": "false",
        "UNIFI_SITE": "default"
      }
    }
  }
}
```

## Variables de Entorno Requeridas

- `UNIFI_HOST`: IP o hostname del controlador UniFi
- `UNIFI_USERNAME`: Usuario administrador
- `UNIFI_PASSWORD`: Contraseña del usuario
- `UNIFI_PORT`: Puerto del controlador (default: 443)
- `UNIFI_VERIFY_SSL`: Verificar certificados SSL (default: false)
- `UNIFI_SITE`: Nombre del sitio (default: "default")

## Alternativa con archivo .env

También puedes crear un archivo `.env` en tu directorio de trabajo:

```bash
UNIFI_HOST=192.168.1.1
UNIFI_USERNAME=admin
UNIFI_PASSWORD=tu_password
UNIFI_PORT=443
UNIFI_VERIFY_SSL=false
UNIFI_SITE=default
```

Y usar esta configuración más simple en Claude Desktop:

```json
{
  "mcpServers": {
    "unifi-site-manager": {
      "command": "unifi-mcp-server"
    }
  }
}
```