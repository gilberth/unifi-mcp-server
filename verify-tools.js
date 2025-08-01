#!/usr/bin/env node

// Script para verificar que todas las herramientas están registradas correctamente
const { spawn } = require('child_process');

console.log('🔍 Verificando herramientas registradas en el servidor MCP...\n');

function listMCPTools() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['dist/index.js'], {
      cwd: '/Users/gilberth/Documents/mcpunifi',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        UNIFI_ROUTER_IP: '192.168.1.1',
        UNIFI_USERNAME: 'admin',
        UNIFI_PASSWORD: 'tu_contraseña_aqui',
        UNIFI_PORT: '443',
        UNIFI_VERIFY_SSL: 'false',
        UNIFI_API_TIMEOUT: '30000'
      }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      resolve({ output, errorOutput, code });
    });

    // Solicitar lista de herramientas
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();

    // Timeout después de 5 segundos
    setTimeout(() => {
      child.kill();
      resolve({ output: 'timeout', errorOutput: '', code: -1 });
    }, 5000);
  });
}

async function verifyTools() {
  try {
    console.log('📡 Solicitando lista de herramientas del servidor MCP...');
    const result = await listMCPTools();
    
    if (result.code === 0 && result.output) {
      console.log('✅ Servidor MCP respondió correctamente\n');
      
      // Buscar respuesta JSON en la salida
      const lines = result.output.split('\n');
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
      
      if (toolsResponse) {
        console.log(`📊 Total de herramientas registradas: ${toolsResponse.length}\n`);
        
        // Categorizar herramientas
        const categories = {
          'Gestión básica': [],
          'Gestión de clientes': [],
          'Gestión de WLAN': [],
          'Estadísticas': [],
          'Hotspot y Portal': [],
          'DPI': [],
          'Firewall': [],
          'QoS': [],
          'VPN': [],
          'Port Forwarding': [],
          'Rutas y Políticas': [],
          'Otros': []
        };
        
        toolsResponse.forEach(tool => {
          const name = tool.name;
          if (name.includes('list_devices') || name.includes('list_clients') || name.includes('get_system_info') || name.includes('get_health_status')) {
            categories['Gestión básica'].push(name);
          } else if (name.includes('block_client') || name.includes('unblock_client') || name.includes('reconnect_client')) {
            categories['Gestión de clientes'].push(name);
          } else if (name.includes('wlan') && (name.includes('create') || name.includes('edit') || name.includes('delete') || name.includes('enable') || name.includes('disable'))) {
            categories['Gestión de WLAN'].push(name);
          } else if (name.includes('get_client_stats') || name.includes('get_device_stats') || name.includes('get_sysinfo_stats') || name.includes('get_authorization_stats') || name.includes('get_sdn_stats')) {
            categories['Estadísticas'].push(name);
          } else if (name.includes('hotspot') || name.includes('voucher')) {
            categories['Hotspot y Portal'].push(name);
          } else if (name.includes('dpi')) {
            categories['DPI'].push(name);
          } else if (name.includes('firewall')) {
            categories['Firewall'].push(name);
          } else if (name.includes('qos')) {
            categories['QoS'].push(name);
          } else if (name.includes('vpn')) {
            categories['VPN'].push(name);
          } else if (name.includes('port_forward')) {
            categories['Port Forwarding'].push(name);
          } else if (name.includes('traffic_route') || name.includes('firewall_policy')) {
            categories['Rutas y Políticas'].push(name);
          } else {
            categories['Otros'].push(name);
          }
        });
        
        // Mostrar herramientas por categoría
        Object.entries(categories).forEach(([category, tools]) => {
          if (tools.length > 0) {
            console.log(`📂 ${category}:`);
            tools.forEach(tool => console.log(`   ✅ ${tool}`));
            console.log('');
          }
        });
        
        // Verificar herramientas nuevas específicas
        const newToolsExpected = [
          'unifi_block_client',
          'unifi_unblock_client', 
          'unifi_reconnect_client',
          'unifi_create_wlan',
          'unifi_edit_wlan',
          'unifi_delete_wlan',
          'unifi_enable_wlan',
          'unifi_disable_wlan',
          'unifi_get_client_stats',
          'unifi_get_device_stats',
          'unifi_get_sysinfo_stats',
          'unifi_get_authorization_stats',
          'unifi_get_sdn_stats',
          'unifi_create_hotspot',
          'unifi_list_hotspot_operators',
          'unifi_create_voucher',
          'unifi_list_vouchers',
          'unifi_revoke_voucher',
          'unifi_list_dpi_stats',
          'unifi_list_dpi_apps',
          'unifi_set_dpi_restrictions'
        ];
        
        const registeredTools = toolsResponse.map(t => t.name);
        const missingTools = newToolsExpected.filter(tool => !registeredTools.includes(tool));
        const foundNewTools = newToolsExpected.filter(tool => registeredTools.includes(tool));
        
        console.log('🎯 Verificación de nuevas herramientas:');
        console.log(`✅ Herramientas nuevas encontradas: ${foundNewTools.length}/${newToolsExpected.length}`);
        
        if (foundNewTools.length > 0) {
          console.log('\n✅ Herramientas nuevas registradas correctamente:');
          foundNewTools.forEach(tool => console.log(`   ✅ ${tool}`));
        }
        
        if (missingTools.length > 0) {
          console.log('\n❌ Herramientas nuevas faltantes:');
          missingTools.forEach(tool => console.log(`   ❌ ${tool}`));
        } else {
          console.log('\n🎉 ¡Todas las herramientas nuevas están registradas correctamente!');
        }
        
      } else {
        console.log('❌ No se pudo obtener la lista de herramientas del servidor');
        console.log('Salida del servidor:', result.output);
      }
    } else {
      console.log('❌ Error al comunicarse con el servidor MCP');
      console.log('Código de salida:', result.code);
      console.log('Error:', result.errorOutput);
    }
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

verifyTools();