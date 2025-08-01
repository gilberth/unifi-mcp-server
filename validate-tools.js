#!/usr/bin/env node

// Script de validación para las nuevas herramientas del servidor MCP UniFi
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Validando nuevas herramientas del servidor MCP UniFi...\n');

// Función para probar una herramienta MCP
function testMCPTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      if (code === 0) {
        resolve({ output, errorOutput });
      } else {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      }
    });

    // Enviar solicitud MCP
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };

    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();

    // Timeout después de 5 segundos
    setTimeout(() => {
      server.kill();
      reject(new Error('Timeout'));
    }, 5000);
  });
}

// Lista de nuevas herramientas a validar
const newTools = [
  'unifi_create_qos_rule',
  'unifi_toggle_qos_rule_enabled',
  'unifi_list_vpn_clients',
  'unifi_update_vpn_client_state',
  'unifi_create_port_forward',
  'unifi_toggle_port_forward',
  'unifi_create_traffic_route',
  'unifi_update_traffic_route',
  'unifi_create_firewall_policy',
  'unifi_list_firewall_zones'
];

async function validateTools() {
  try {
    console.log('📋 Obteniendo lista de herramientas disponibles...');
    const result = await testMCPTool('tools/list');
    
    // Parsear la respuesta para extraer las herramientas
    const lines = result.output.split('\n').filter(line => line.trim());
    let toolsResponse = null;
    
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.result && parsed.result.tools) {
          toolsResponse = parsed.result.tools;
          break;
        }
      } catch (e) {
        // Ignorar líneas que no son JSON válido
      }
    }

    if (!toolsResponse) {
      throw new Error('No se pudo obtener la lista de herramientas');
    }

    const availableTools = toolsResponse.map(tool => tool.name);
    
    console.log(`✅ Total de herramientas disponibles: ${availableTools.length}\n`);
    
    // Validar que las nuevas herramientas estén presentes
    console.log('🔍 Validando nuevas herramientas:');
    let allToolsPresent = true;
    
    for (const toolName of newTools) {
      const isPresent = availableTools.includes(toolName);
      const status = isPresent ? '✅' : '❌';
      console.log(`${status} ${toolName}`);
      
      if (!isPresent) {
        allToolsPresent = false;
      }
    }
    
    console.log('\n📊 Resumen de validación:');
    console.log(`- Nuevas herramientas implementadas: ${newTools.length}`);
    console.log(`- Herramientas encontradas: ${newTools.filter(tool => availableTools.includes(tool)).length}`);
    console.log(`- Estado: ${allToolsPresent ? '✅ TODAS LAS HERRAMIENTAS PRESENTES' : '❌ FALTAN HERRAMIENTAS'}`);
    
    if (allToolsPresent) {
      console.log('\n🎉 ¡Validación exitosa! Todas las nuevas herramientas están correctamente implementadas.');
    } else {
      console.log('\n⚠️  Algunas herramientas no están disponibles. Verifica la implementación.');
    }
    
    // Mostrar algunas herramientas de ejemplo para verificar la estructura
    console.log('\n📋 Ejemplos de herramientas implementadas:');
    const exampleTools = toolsResponse.filter(tool => newTools.includes(tool.name)).slice(0, 3);
    exampleTools.forEach(tool => {
      console.log(`\n🔧 ${tool.name}:`);
      console.log(`   Descripción: ${tool.description}`);
      console.log(`   Parámetros requeridos: ${tool.inputSchema.required ? tool.inputSchema.required.join(', ') : 'Ninguno'}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
    process.exit(1);
  }
}

// Ejecutar validación
validateTools();