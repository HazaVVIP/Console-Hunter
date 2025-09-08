/**
 * =============================================================================
 *  Console Hunter Tool Loader v1.0 - Easy Tool Management
 * =============================================================================
 * Fungsi:
 * 1. Memuat dan menjalankan tools dengan mudah
 * 2. Menyediakan daftar tools yang tersedia
 * 3. Batch loading untuk comprehensive assessment
 * 4. Error handling dan logging yang konsisten
 * =============================================================================
 */

(function() {
    if (typeof log === 'undefined') {
        console.error('ERROR: Tool Loader harus dijalankan di dalam Interactive Workbench.');
        return;
    }

    log.info('=== CONSOLE HUNTER TOOL LOADER v1.0 ===');

    // Daftar tools yang tersedia
    const availableTools = {
        // Original Tools
        'dom-extractor': {
            file: 'DOM-Extractor.js',
            description: 'Ekstrak dan tampilkan snapshot DOM halaman',
            category: 'DOM Analysis'
        },
        'firebase-token': {
            file: 'Firebase-Token-Exfiltrator.js', 
            description: 'Intercept dan steal Firebase authentication tokens',
            category: 'Token Extraction'
        },
        'deep-inspector': {
            file: 'deep-inspector.js',
            description: 'Inspect window object properties secara mendalam',
            category: 'Object Analysis'
        },
        'prompt-injection': {
            file: 'prompt_injection.js',
            description: 'Test prompt injection vulnerabilities untuk AI/API',
            category: 'Injection Testing'
        },
        'data-webhook': {
            file: 'ekstrak-data-webhook.js',
            description: 'Kumpulkan dan kirim data ke webhook external',
            category: 'Data Exfiltration'
        },
        'token-impersonation': {
            file: 'tokenid.js',
            description: 'Live impersonation attack untuk identity theft',
            category: 'Authentication'
        },
        'screenshot': {
            file: 'screenshot.js',
            description: 'Ambil screenshot halaman target',
            category: 'Documentation'
        },
        'network-scan': {
            file: 'scan-ip.js',
            description: 'Network scanning dan IP detection',
            category: 'Network Analysis'
        },
        'object-keys': {
            file: 'Object.keys(window).js',
            description: 'Enumerasi window object properties',
            category: 'Object Analysis'
        },
        
        // Enhanced Tools
        'parent-inspector': {
            file: 'parent-page-inspector.js',
            description: 'Test parent window access, postMessage, dan CSP bypass',
            category: 'Parent Page Testing'
        },
        'network-inspector': {
            file: 'websocket-network-inspector.js', 
            description: 'WebSocket interception, SSRF testing, network analysis',
            category: 'Network Analysis'
        },
        'csrf-session': {
            file: 'csrf-session-tester.js',
            description: 'CSRF token detection, session analysis, authentication security',
            category: 'Authentication'
        }
    };

    // Categories untuk organized display
    const categories = {
        'DOM Analysis': [],
        'Token Extraction': [],
        'Object Analysis': [],
        'Injection Testing': [],
        'Data Exfiltration': [],
        'Authentication': [],
        'Documentation': [],
        'Network Analysis': [],
        'Parent Page Testing': []
    };

    // Organize tools by category
    Object.entries(availableTools).forEach(([key, tool]) => {
        categories[tool.category].push({key, ...tool});
    });

    // Function to load individual tool
    window.loadTool = async function(toolKey, baseURL = 'http://localhost:8080') {
        if (!availableTools[toolKey]) {
            log.error(`❌ Tool '${toolKey}' tidak ditemukan. Gunakan listTools() untuk melihat daftar tools.`);
            return false;
        }

        const tool = availableTools[toolKey];
        log.info(`🔧 Loading ${tool.description}...`);

        try {
            const response = await fetch(`${baseURL}/${tool.file}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const code = await response.text();
            eval(code);
            log.success(`✅ ${toolKey} loaded successfully!`);
            return true;
        } catch (error) {
            log.error(`❌ Failed to load ${toolKey}: ${error.message}`);
            return false;
        }
    };

    // Function to list available tools
    window.listTools = function() {
        log.info('📋 Available Console Hunter Tools:');
        log.info('');
        
        Object.entries(categories).forEach(([category, tools]) => {
            if (tools.length > 0) {
                log.info(`📁 ${category}:`);
                tools.forEach(tool => {
                    log.info(`  🔧 ${tool.key} - ${tool.description}`);
                });
                log.info('');
            }
        });
        
        log.info('💡 Usage: loadTool("tool-name")');
        log.info('💡 Example: loadTool("parent-inspector")');
    };

    // Function to load multiple tools
    window.loadTools = async function(toolKeys, baseURL = 'http://localhost:8080', delay = 2000) {
        log.info(`🚀 Loading ${toolKeys.length} tools with ${delay}ms delay between each...`);
        
        const results = [];
        for (const toolKey of toolKeys) {
            const result = await loadTool(toolKey, baseURL);
            results.push({tool: toolKey, success: result});
            
            if (toolKey !== toolKeys[toolKeys.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        log.success(`✅ Batch loading complete: ${successful} successful, ${failed} failed`);
        return results;
    };

    // Predefined tool sets untuk common scenarios
    window.toolSets = {
        'basic-recon': ['dom-extractor', 'deep-inspector', 'object-keys'],
        'parent-page-testing': ['parent-inspector', 'csrf-session', 'dom-extractor'],
        'network-analysis': ['network-inspector', 'network-scan'],
        'authentication-testing': ['csrf-session', 'firebase-token', 'token-impersonation'],
        'full-assessment': ['parent-inspector', 'network-inspector', 'csrf-session', 'dom-extractor', 'deep-inspector'],
        'data-exfiltration': ['data-webhook', 'firebase-token', 'screenshot'],
        'injection-testing': ['prompt-injection', 'parent-inspector']
    };

    // Function to load predefined tool sets
    window.loadToolSet = function(setName, baseURL = 'http://localhost:8080', delay = 2000) {
        if (!toolSets[setName]) {
            log.error(`❌ Tool set '${setName}' tidak ditemukan.`);
            log.info('Available tool sets:');
            Object.keys(toolSets).forEach(set => {
                log.info(`  📦 ${set}: ${toolSets[set].join(', ')}`);
            });
            return;
        }

        log.info(`📦 Loading tool set: ${setName}`);
        log.info(`Tools: ${toolSets[setName].join(', ')}`);
        
        return loadTools(toolSets[setName], baseURL, delay);
    };

    // Function to show tool sets
    window.listToolSets = function() {
        log.info('📦 Available Tool Sets:');
        log.info('');
        
        Object.entries(toolSets).forEach(([setName, tools]) => {
            log.info(`📦 ${setName}:`);
            log.info(`   ${tools.join(', ')}`);
            log.info('');
        });
        
        log.info('💡 Usage: loadToolSet("set-name")');
        log.info('💡 Example: loadToolSet("parent-page-testing")');
    };

    // Enhanced error handling function
    window.troubleshootTool = async function(toolKey, baseURL = 'http://localhost:8080') {
        log.info(`🔍 Troubleshooting tool: ${toolKey}`);
        
        if (!availableTools[toolKey]) {
            log.error(`❌ Tool '${toolKey}' tidak ditemukan dalam registry`);
            return;
        }

        const tool = availableTools[toolKey];
        const url = `${baseURL}/${tool.file}`;
        
        try {
            log.info(`Testing connection to: ${url}`);
            const response = await fetch(url, { method: 'HEAD' });
            
            if (response.ok) {
                log.success(`✅ File accessible: ${response.status} ${response.statusText}`);
                log.info(`File size: ${response.headers.get('content-length') || 'unknown'} bytes`);
                log.info(`Content-Type: ${response.headers.get('content-type') || 'unknown'}`);
            } else {
                log.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            log.error(`❌ Network Error: ${error.message}`);
            log.info('Possible causes:');
            log.info('  - Server tidak running');
            log.info('  - CORS policy blocking request');
            log.info('  - File tidak ditemukan');
            log.info('  - Network connectivity issue');
        }
    };

    // Quick help function
    window.consoleHunterHelp = function() {
        log.info('🎯 CONSOLE HUNTER TOOL LOADER - HELP');
        log.info('');
        log.info('📋 Main Commands:');
        log.info('  listTools()              - Show all available tools');
        log.info('  loadTool("tool-name")    - Load a specific tool');
        log.info('  loadTools([...])         - Load multiple tools');
        log.info('  listToolSets()           - Show predefined tool sets');
        log.info('  loadToolSet("set-name")  - Load a predefined tool set');
        log.info('  troubleshootTool("name") - Debug tool loading issues');
        log.info('');
        log.info('🚀 Quick Start Examples:');
        log.info('  loadTool("parent-inspector")');
        log.info('  loadToolSet("full-assessment")');
        log.info('  loadTools(["csrf-session", "network-inspector"])');
        log.info('');
        log.info('📦 Recommended Tool Sets:');
        log.info('  🎯 parent-page-testing   - For parent window exploitation');
        log.info('  🌐 network-analysis      - For SSRF and network testing');
        log.info('  🔐 authentication-testing - For auth bypass testing');
        log.info('  🔍 full-assessment       - Comprehensive security testing');
    };

    // Auto-display help on load
    log.success('✅ Console Hunter Tool Loader initialized!');
    log.info('');
    consoleHunterHelp();

    // Make functions globally available
    window.chtl = {
        load: loadTool,
        loadMultiple: loadTools,
        loadSet: loadToolSet,
        list: listTools,
        listSets: listToolSets,
        help: consoleHunterHelp,
        troubleshoot: troubleshootTool,
        tools: availableTools,
        sets: toolSets
    };

    log.info('');
    log.info('💡 Short aliases available via window.chtl object');
    log.info('   Example: chtl.load("parent-inspector")');

})();