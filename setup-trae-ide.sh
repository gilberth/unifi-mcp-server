#!/bin/bash

# Script de configuración para Trae IDE con UniFi MCP Server
# Autor: Gilberth Cordova

echo "🚀 Configurando Trae IDE con UniFi MCP Server..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    show_error "Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    show_error "Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

show_message "Node.js $(node -v) detectado"

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    show_error "npm no está disponible"
    exit 1
fi

show_message "npm $(npm -v) detectado"

# Crear directorio de configuración de Trae si no existe
TRAE_CONFIG_DIR="$HOME/.config/trae"
if [ ! -d "$TRAE_CONFIG_DIR" ]; then
    mkdir -p "$TRAE_CONFIG_DIR"
    show_message "Directorio de configuración de Trae creado: $TRAE_CONFIG_DIR"
fi

# Solicitar configuración del usuario
echo ""
echo "📝 Configuración de tu controlador UniFi:"
echo ""

read -p "🌐 IP del controlador UniFi (default: 192.168.1.1): " UNIFI_IP
UNIFI_IP=${UNIFI_IP:-192.168.1.1}

read -p "👤 Usuario administrador (default: admin): " UNIFI_USER
UNIFI_USER=${UNIFI_USER:-admin}

read -s -p "🔐 Contraseña: " UNIFI_PASS
echo ""

read -p "🔌 Puerto (default: 443): " UNIFI_PORT
UNIFI_PORT=${UNIFI_PORT:-443}

read -p "🔒 Verificar SSL? (true/false, default: false): " UNIFI_SSL
UNIFI_SSL=${UNIFI_SSL:-false}

# Crear archivo de configuración MCP
MCP_CONFIG_FILE="$TRAE_CONFIG_DIR/mcp_servers.json"

cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "unifi-mcp-server": {
      "command": "npx",
      "args": ["unifi-mcp-server@latest"],
      "env": {
        "UNIFI_ROUTER_IP": "$UNIFI_IP",
        "UNIFI_USERNAME": "$UNIFI_USER",
        "UNIFI_PASSWORD": "$UNIFI_PASS",
        "UNIFI_PORT": "$UNIFI_PORT",
        "UNIFI_VERIFY_SSL": "$UNIFI_SSL",
        "UNIFI_API_TIMEOUT": "30000"
      }
    }
  }
}
EOF

show_message "Archivo de configuración MCP creado: $MCP_CONFIG_FILE"

# Probar la conexión
echo ""
echo "🧪 Probando conexión con el controlador UniFi..."

# Crear archivo temporal para prueba
TEMP_ENV_FILE=$(mktemp)
cat > "$TEMP_ENV_FILE" << EOF
UNIFI_ROUTER_IP=$UNIFI_IP
UNIFI_USERNAME=$UNIFI_USER
UNIFI_PASSWORD=$UNIFI_PASS
UNIFI_PORT=$UNIFI_PORT
UNIFI_VERIFY_SSL=$UNIFI_SSL
UNIFI_API_TIMEOUT=30000
EOF

# Probar con npx (esto descargará el paquete si no está disponible)
echo "📦 Descargando/verificando unifi-mcp-server..."
if timeout 60 npx unifi-mcp-server@latest --test-connection 2>/dev/null; then
    show_message "Conexión exitosa con el controlador UniFi"
else
    show_warning "No se pudo verificar la conexión. Verifica tu configuración."
fi

# Limpiar archivo temporal
rm -f "$TEMP_ENV_FILE"

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Abre Trae IDE"
echo "2. Ve a Configuración > MCP Servers"
echo "3. Importa el archivo: $MCP_CONFIG_FILE"
echo "4. Reinicia Trae IDE"
echo ""
echo "💡 Comandos útiles:"
echo "   - Probar servidor: npx unifi-mcp-server@latest"
echo "   - Ver logs: MCP_LOG_LEVEL=debug npx unifi-mcp-server@latest"
echo ""
echo "🔗 Documentación: https://github.com/gilberth/unifi-mcp-server-ts"
echo ""