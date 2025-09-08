/**
 * =============================================================================
 *  WebSocket & Network Inspector v1.0 - Advanced Network Analysis
 * =============================================================================
 * Tujuan:
 * 1. Menginspeksi dan menginterupsi koneksi WebSocket
 * 2. Mendeteksi kerentanan SSRF
 * 3. Menganalisis header HTTP dan response
 * 4. Menguji bypass firewall dan filter
 * 5. Mendeteksi services internal yang dapat diakses
 * =============================================================================
 */

(function() {
    if (typeof log === 'undefined') {
        console.error('ERROR: WebSocket Inspector harus dijalankan di dalam Interactive Workbench.');
        return;
    }

    log.info('=== WEBSOCKET & NETWORK INSPECTOR v1.0 ===');

    // 1. WebSocket Hijacking and Inspection
    function initWebSocketInspector() {
        log.info('--- Initializing WebSocket Inspector ---');
        
        // Save original WebSocket constructor
        const OriginalWebSocket = window.WebSocket;
        
        // Override WebSocket constructor
        window.WebSocket = function(url, protocols) {
            log.success(`🔌 WebSocket connection intercepted: ${url}`);
            
            const ws = new OriginalWebSocket(url, protocols);
            
            // Log connection events
            ws.addEventListener('open', function(event) {
                log.success(`✅ WebSocket opened: ${url}`);
                log.info(`Protocol: ${ws.protocol}`);
                log.info(`ReadyState: ${ws.readyState}`);
            });
            
            ws.addEventListener('close', function(event) {
                log.warn(`❌ WebSocket closed: ${url}`);
                log.info(`Code: ${event.code}, Reason: ${event.reason}`);
            });
            
            ws.addEventListener('error', function(event) {
                log.error(`🚫 WebSocket error: ${url}`);
                console.error('WebSocket error details:', event);
            });
            
            // Intercept messages
            ws.addEventListener('message', function(event) {
                log.info(`📨 WebSocket message received from ${url}:`);
                try {
                    const data = JSON.parse(event.data);
                    log.info('Parsed JSON data:');
                    log.info(JSON.stringify(data, null, 2));
                    
                    // Look for sensitive data in messages
                    checkForSensitiveData(event.data);
                } catch (e) {
                    log.info(`Raw data: ${event.data.substring(0, 200)}${event.data.length > 200 ? '...' : ''}`);
                }
            });
            
            // Override send method to intercept outgoing messages
            const originalSend = ws.send;
            ws.send = function(data) {
                log.info(`📤 WebSocket message sent to ${url}:`);
                try {
                    const parsedData = JSON.parse(data);
                    log.info('Parsed JSON data:');
                    log.info(JSON.stringify(parsedData, null, 2));
                } catch (e) {
                    log.info(`Raw data: ${data.toString().substring(0, 200)}${data.toString().length > 200 ? '...' : ''}`);
                }
                return originalSend.call(this, data);
            };
            
            return ws;
        };
        
        // Copy static properties
        Object.setPrototypeOf(window.WebSocket.prototype, OriginalWebSocket.prototype);
        Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
        
        log.success('✅ WebSocket inspector initialized');
    }

    // 2. SSRF Detection and Testing
    function testSSRFVulnerabilities() {
        log.info('--- Testing SSRF Vulnerabilities ---');
        
        const ssrfTargets = [
            // Local network scanning
            'http://127.0.0.1:22',    // SSH
            'http://127.0.0.1:3306',  // MySQL
            'http://127.0.0.1:5432',  // PostgreSQL
            'http://127.0.0.1:6379',  // Redis
            'http://127.0.0.1:9200',  // Elasticsearch
            'http://127.0.0.1:8080',  // Common web port
            'http://localhost:3000',   // Node.js common
            'http://localhost:8000',   // Django common
            
            // Cloud metadata services
            'http://169.254.169.254/latest/meta-data/',  // AWS
            'http://metadata.google.internal/computeMetadata/v1/', // GCP
            'http://169.254.169.254/metadata/instance?api-version=2021-02-01', // Azure
            
            // Private network ranges
            'http://10.0.0.1',
            'http://192.168.1.1',
            'http://172.16.0.1'
        ];
        
        log.info(`🔍 Testing ${ssrfTargets.length} SSRF targets...`);
        
        ssrfTargets.forEach((target, index) => {
            setTimeout(() => {
                testSSRFTarget(target);
            }, index * 500); // Stagger requests
        });
    }

    async function testSSRFTarget(url) {
        try {
            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                mode: 'no-cors' // Try to bypass CORS for SSRF detection
            });
            
            clearTimeout(timeoutId);
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            log.success(`✅ SSRF Response from ${url}:`);
            log.info(`Status: ${response.status}, Response Time: ${responseTime}ms`);
            log.info(`Type: ${response.type}, Redirected: ${response.redirected}`);
            
            // Try to read response if possible
            try {
                const text = await response.text();
                if (text && text.length > 0) {
                    log.info(`Response preview: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
                }
            } catch (e) {
                log.warn(`Cannot read response body: ${e.message}`);
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                log.warn(`⏱️ SSRF request timeout: ${url}`);
            } else if (error.message.includes('CORS')) {
                log.info(`🔒 CORS blocked (expected): ${url}`);
            } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
                log.info(`🚫 Connection refused: ${url}`);
            } else if (error.message.includes('net::ERR_TIMED_OUT')) {
                log.warn(`⏱️ Connection timeout: ${url}`);
            } else {
                log.error(`❌ SSRF test failed for ${url}: ${error.message}`);
            }
        }
    }

    // 3. Advanced HTTP Header Analysis
    function analyzeHTTPHeaders() {
        log.info('--- Analyzing HTTP Headers ---');
        
        // Test various endpoints for header information
        const testEndpoints = [
            'https://httpbin.org/headers',
            'https://httpbin.org/ip',
            'https://httpbin.org/user-agent',
            window.location.origin + '/favicon.ico',
            window.location.origin + '/.well-known/security.txt',
            window.location.origin + '/robots.txt'
        ];
        
        testEndpoints.forEach((endpoint, index) => {
            setTimeout(() => {
                analyzeEndpointHeaders(endpoint);
            }, index * 1000);
        });
    }

    async function analyzeEndpointHeaders(url) {
        try {
            const response = await fetch(url, {
                method: 'HEAD'
            });
            
            log.info(`📊 Headers analysis for ${url}:`);
            log.info(`Status: ${response.status} ${response.statusText}`);
            
            const headers = {};
            response.headers.forEach((value, name) => {
                headers[name] = value;
            });
            
            // Check for security headers
            const securityHeaders = [
                'content-security-policy',
                'x-frame-options',
                'x-content-type-options',
                'strict-transport-security',
                'x-xss-protection',
                'referrer-policy',
                'permissions-policy'
            ];
            
            securityHeaders.forEach(header => {
                if (headers[header]) {
                    log.success(`✅ ${header}: ${headers[header]}`);
                } else {
                    log.warn(`⚠️ Missing security header: ${header}`);
                }
            });
            
            // Check for information disclosure headers
            const infoHeaders = [
                'server',
                'x-powered-by',
                'x-aspnet-version',
                'x-runtime',
                'via'
            ];
            
            infoHeaders.forEach(header => {
                if (headers[header]) {
                    log.warn(`🔍 Information disclosure - ${header}: ${headers[header]}`);
                }
            });
            
            log.info('All headers:');
            log.info(JSON.stringify(headers, null, 2));
            
        } catch (error) {
            log.error(`❌ Header analysis failed for ${url}: ${error.message}`);
        }
    }

    // 4. Port Scanner (Limited by CORS)
    function scanCommonPorts() {
        log.info('--- Scanning Common Ports ---');
        
        const commonPorts = [80, 443, 8080, 8443, 3000, 3001, 8000, 8001, 9000, 9001];
        const targetHost = window.location.hostname;
        
        log.info(`🔍 Scanning ports on ${targetHost}...`);
        
        commonPorts.forEach((port, index) => {
            setTimeout(() => {
                scanPort(targetHost, port);
            }, index * 200);
        });
    }

    async function scanPort(host, port) {
        const testURL = `http://${host}:${port}`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(testURL, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors'
            });
            
            clearTimeout(timeoutId);
            log.success(`✅ Port ${port} is open on ${host}`);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                log.warn(`⏱️ Port ${port} timeout on ${host}`);
            } else if (error.message.includes('CONNECTION_REFUSED')) {
                log.info(`🚫 Port ${port} is closed on ${host}`);
            } else {
                log.info(`❓ Port ${port} status unknown: ${error.message}`);
            }
        }
    }

    // 5. Check for sensitive data in network traffic
    function checkForSensitiveData(data) {
        const sensitivePatterns = {
            'API Keys': /["\']?api[_-]?key["\']?\s*[:=]\s*["\'][a-zA-Z0-9_-]{20,}["\']|["\']?key["\']?\s*[:=]\s*["\'][a-zA-Z0-9_-]{32,}["\']|["\']?token["\']?\s*[:=]\s*["\'][a-zA-Z0-9_.-]{20,}["\']|bearer\s+[a-zA-Z0-9_.-]{20,}/gi,
            'JWT Tokens': /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,
            'Session IDs': /session[_-]?id["\']?\s*[:=]\s*["\'][^"\']+["\']|PHPSESSID=[^;]+|jsessionid=[^;]+/gi,
            'Credit Cards': /\b(?:\d{4}[\s-]?){3}\d{4}\b/gi,
            'Passwords': /["\']?password["\']?\s*[:=]\s*["\'][^"\']+["\']|["\']?passwd["\']?\s*[:=]\s*["\'][^"\']+["\']|["\']?pwd["\']?\s*[:=]\s*["\'][^"\']+["\']|["\']?pass["\']?\s*[:=]\s*["\'][^"\']+["\']/gi
        };
        
        Object.entries(sensitivePatterns).forEach(([type, pattern]) => {
            const matches = data.match(pattern);
            if (matches) {
                log.warn(`🔍 Sensitive data detected in network traffic - ${type}:`);
                matches.forEach((match, index) => {
                    if (index < 3) { // Limit output
                        log.warn(`  ${match.substring(0, 80)}${match.length > 80 ? '...' : ''}`);
                    }
                });
                if (matches.length > 3) {
                    log.warn(`  ... and ${matches.length - 3} more matches`);
                }
            }
        });
    }

    // 6. DNS Rebinding Test
    function testDNSRebinding() {
        log.info('--- Testing DNS Rebinding Vulnerability ---');
        
        // Test requests to domains that might resolve to local addresses
        const rebindingDomains = [
            'localhost.evil.com',
            '127.0.0.1.evil.com',
            '10.0.0.1.evil.com',
            'localtest.me' // Actually resolves to 127.0.0.1
        ];
        
        rebindingDomains.forEach((domain, index) => {
            setTimeout(() => {
                testRebindingDomain(domain);
            }, index * 1000);
        });
    }

    async function testRebindingDomain(domain) {
        try {
            const response = await fetch(`http://${domain}:8080/`, {
                method: 'GET',
                mode: 'no-cors'
            });
            
            log.warn(`⚠️ DNS Rebinding possible with domain: ${domain}`);
            log.info(`Response type: ${response.type}`);
            
        } catch (error) {
            log.info(`✅ DNS Rebinding blocked for domain: ${domain}`);
        }
    }

    // Main execution
    log.info('🚀 Starting Advanced Network Security Assessment...');
    
    // Initialize WebSocket inspector
    initWebSocketInspector();
    
    // Run tests with delays to avoid overwhelming the target
    setTimeout(() => testSSRFVulnerabilities(), 1000);
    setTimeout(() => analyzeHTTPHeaders(), 5000);
    setTimeout(() => scanCommonPorts(), 10000);
    setTimeout(() => testDNSRebinding(), 15000);
    
    log.info('⏱️ Network assessment started... Results will appear above.');
    log.info('🔌 WebSocket inspector is now active - any WebSocket connections will be intercepted.');
    log.success('📝 This tool is designed for authorized security testing only.');

})();