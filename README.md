# MCP UniFi Basic Server

Servidor MCP (Model Context Protocol) básico para gestión de redes UniFi, optimizado para despliegue en Smithery.

## 🚀 Características Principales

### 🔥 **Gestión Completa de Firewall**
- ✅ **Visualizar reglas de firewall** existentes
- ✅ **Crear nuevas reglas** de firewall
- ✅ **Gestionar grupos de firewall** (IPs y puertos)
- ✅ **Configurar port forwarding**
- ✅ **Auditorías de seguridad** automatizadas

### 🔧 **Gestión de Dispositivos**
- ✅ **Monitoreo en tiempo real** de todos los dispositivos UniFi
- ✅ **Estado de salud** y métricas de rendimiento
- ✅ **Información detallada** de APs, switches y gateways
- ✅ **Gestión de clientes** conectados

### 🌐 **Configuración de Red**
- ✅ **Gestión de WLANs** (redes inalámbricas)
- ✅ **Configuración de VLANs** y subredes
- ✅ **Configuraciones de red** avanzadas
- ✅ **Monitoreo de eventos** del sistema

### 📊 **Monitoreo y Análisis**
- ✅ **Eventos del sistema** en tiempo real
- ✅ **Alarmas y alertas** activas
- ✅ **Estadísticas de rendimiento**
- ✅ **Reportes automatizados** de salud de red

## 📋 Requisitos

- **Python 3.8+**
- **Claude Desktop**
- **Controlador UniFi** (Dream Machine, Cloud Key, o instalación local)
- **Credenciales de administrador** del controlador UniFi
- **Conectividad de red** al controlador UniFi

## ⚡ Instalación Rápida

### 1️⃣ **Clonar el Repositorio**
```bash
git clone <repository-url>
cd mcpunifi
```

### 2️⃣ **Instalar Dependencias**
```bash
pip install -r requirements.txt
```

### 3️⃣ **Configurar Credenciales**
Edita el archivo `.env`:
```bash
# Configuración de la API Local del Router UniFi
UNIFI_ROUTER_IP=192.168.1.1        # IP de tu controlador UniFi
UNIFI_USERNAME=admin               # Usuario administrador
UNIFI_PASSWORD=TuContraseñaSegura  # Contraseña del administrador

# Configuración opcional
UNIFI_PORT=8443                    # Puerto (por defecto: 8443)
UNIFI_VERIFY_SSL=false            # false para certificados autofirmados
UNIFI_TIMEOUT=30                   # Timeout en segundos
UNIFI_DEFAULT_SITE=default         # Sitio por defecto
```

### 4️⃣ **Configurar Claude Desktop**
```bash
# Ejecutar configuración automática
python setup_client.py
```

### 5️⃣ **Reiniciar Claude Desktop**
¡Listo! El servidor "UniFi Local Controller" aparecerá en las herramientas de Claude.

## 🛠️ Herramientas Disponibles

### 📋 **Información Básica**
| Herramienta | Descripción |
|---|---|
| `list_devices` | Lista todos los dispositivos UniFi |
| `list_clients` | Lista todos los clientes conectados |
| `get_system_info` | Información del sistema UniFi |
| `get_health_status` | Estado de salud general |

### 🔥 **Firewall y Seguridad**
| Herramienta | Descripción |
|---|---|
| `list_firewall_rules` | Lista todas las reglas de firewall |
| `get_firewall_rule` | Detalles de una regla específica |
| `list_firewall_groups` | Lista grupos de firewall |
| `create_firewall_rule` | Crea nueva regla de firewall |

### 🌐 **Configuración de Red**
| Herramienta | Descripción |
|---|---|
| `list_wlan_configs` | Configuraciones de WLAN |
| `list_network_configs` | Configuraciones de red/VLANs |
| `list_port_forwarding` | Reglas de port forwarding |

### 📊 **Eventos y Monitoreo**
| Herramienta | Descripción |
|---|---|
| `list_events` | Eventos del sistema |
| `list_alarms` | Alarmas activas y archivadas |

## 💡 Ejemplos de Uso

### 🔍 **Monitoreo Básico**
```
"Lista todos los dispositivos UniFi"
"Muestra el estado de salud del sistema"
"¿Cuántos clientes están conectados?"
"Genera un reporte de salud de la red"
```

### 🔥 **Gestión de Firewall**
```
"Muestra todas las reglas de firewall"
"Lista los grupos de firewall configurados"
"Crea una regla de firewall para bloquear el puerto 22"
"¿Hay alguna regla que permita SSH desde internet?"
```

### 🌐 **Configuración de Red**
```
"Lista todas las configuraciones de WLAN"
"Muestra las configuraciones de red y VLANs"
"¿Qué reglas de port forwarding están activas?"
"Analiza la configuración de red inalámbrica"
```

### 📊 **Eventos y Troubleshooting**
```
"Muestra los eventos recientes del sistema"
"¿Hay alarmas activas en el sistema?"
"Identifica dispositivos con problemas de conectividad"
"Genera un reporte de eventos de las últimas 24 horas"
```

## 🔐 Consideraciones de Seguridad

### ✅ **Ventajas de la API Local**
- 🔒 **Control total**: Acceso directo sin intermediarios
- 🔒 **Datos locales**: Información no sale de tu red
- 🔒 **Sin dependencias externas**: No requiere servicios de Ubiquiti
- 🔒 **Autenticación local**: Credenciales bajo tu control

### 🛡️ **Mejores Prácticas**
- 🔐 **Usa contraseñas fuertes** para el usuario administrador
- 🔐 **Considera crear un usuario específico** para la API
- 🔐 **Mantén actualizado** el firmware del controlador UniFi
- 🔐 **No compartas** el archivo `.env`
- 🔐 **Usa HTTPS** siempre que sea posible

### 👤 **Usuario Dedicado (Recomendado)**
```bash
# En la interfaz UniFi Network:
# Settings > Admins > Add Admin
# - Crear usuario específico para API
# - Asignar permisos mínimos necesarios
# - Usar credenciales dedicadas en .env
```

## 🆚 API Local vs API de Nube

| Característica | API Local | API de Nube |
|---|---|---|
| **Firewall** | ✅ Completo | ❌ No disponible |
| **Configuración** | ✅ Lectura/escritura | ❌ Solo lectura |
| **Velocidad** | ✅ Muy rápida | ⚠️ Dependiente de internet |
| **Privacidad** | ✅ Datos locales | ⚠️ Datos en la nube |
| **Dependencias** | Red local únicamente | Internet + Ubiquiti Cloud |

## 🔧 Solución de Problemas

### **Error: "No se puede conectar al controlador"**
```bash
# Verificar conectividad
ping TU_IP_UNIFI

# Verificar puerto
telnet TU_IP_UNIFI 8443
```

### **Error: "Credenciales inválidas"**
- ✅ Verifica usuario y contraseña en la interfaz web
- ✅ Asegúrate de que el usuario tenga permisos de administrador

### **Error: "SSL Certificate Error"**
```bash
# En el archivo .env:
UNIFI_VERIFY_SSL=false
```

### **Error: "Timeout de conexión"**
```bash
# En el archivo .env:
UNIFI_TIMEOUT=60
```

## 📁 Estructura del Proyecto

```
mcpunifi/
├── unifi_mcp_server.py     # Servidor MCP principal
├── config.py               # Configuración y endpoints
├── setup_client.py         # Script de configuración automática
├── requirements.txt        # Dependencias Python
├── .env                    # Variables de entorno (credenciales)
├── CLIENT_SETUP.md         # Guía de configuración detallada
├── API_SCOPE.md            # Documentación de capacidades
└── README.md               # Este archivo
```

## 🚀 Futuras Expansiones

### 🔄 **Próximas Implementaciones**
- ✏️ **Gestión completa de firewall**: Crear, modificar, eliminar reglas
- ✏️ **Configuración de WLANs**: Crear y gestionar redes inalámbricas
- ✏️ **Gestión de clientes**: Bloquear, limitar bandwidth, etc.
- ✏️ **Port forwarding**: Configurar redirección de puertos
- ✏️ **Gestión de dispositivos**: Reiniciar, adoptar, actualizar

### 📊 **Métricas Avanzadas**
- 📈 **Estadísticas históricas**: Datos de rendimiento a largo plazo
- 📈 **DPI detallado**: Análisis profundo de tráfico
- 📈 **Reportes automatizados**: Generación de reportes periódicos
- 📈 **Alertas personalizadas**: Configuración de alertas avanzadas

## 📚 Recursos Adicionales

- **[Guía de Configuración Completa](CLIENT_SETUP.md)** - Instrucciones detalladas paso a paso
- **[Documentación de Capacidades](API_SCOPE.md)** - Funcionalidades disponibles y limitaciones
- **[Documentación UniFi](https://help.ui.com)** - Documentación oficial de Ubiquiti
- **[Comunidad UniFi](https://community.ui.com)** - Foro de la comunidad

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crea un Pull Request**

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa la [Guía de Configuración](CLIENT_SETUP.md)**
2. **Consulta la [Documentación de Capacidades](API_SCOPE.md)**
3. **Verifica la conectividad** al controlador UniFi
4. **Ejecuta** `python setup_client.py` para diagnósticos

---

¡Disfruta de la gestión completa de tu infraestructura UniFi a través de Claude! 🎉

**Desarrollado con ❤️ para la comunidad UniFi**