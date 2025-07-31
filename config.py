"""
Configuración para el servidor MCP UniFi
"""

import os
from typing import Optional
from pydantic import BaseModel


class UniFiConfig(BaseModel):
    """Configuración para la conexión UniFi"""
    
    router_ip: str
    username: str
    password: str
    port: int = 443
    verify_ssl: bool = False
    timeout: int = 30
    
    @classmethod
    def from_env(cls) -> "UniFiConfig":
        """Crea configuración desde variables de entorno"""
        return cls(
            router_ip=os.getenv("UNIFI_ROUTER_IP", "192.168.1.1"),
            username=os.getenv("UNIFI_USERNAME", "admin"),
            password=os.getenv("UNIFI_PASSWORD", "password"),
            port=int(os.getenv("UNIFI_PORT", "443")),
            verify_ssl=os.getenv("UNIFI_VERIFY_SSL", "false").lower() == "true",
            timeout=int(os.getenv("UNIFI_API_TIMEOUT", "30"))
        )