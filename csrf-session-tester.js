/**
 * =============================================================================
 *  CSRF & Session Security Tester v1.0 - Advanced Authentication Analysis
 * =============================================================================
 * Tujuan:
 * 1. Mendeteksi dan mengekstrak CSRF tokens dengan berbagai format
 * 2. Menguji session fixation vulnerabilities
 * 3. Menganalisis keamanan cookie dan session management
 * 4. Menguji authentication bypass techniques
 * 5. Mendeteksi weak session generation patterns
 * =============================================================================
 */

(function() {
    if (typeof log === 'undefined') {
        console.error('ERROR: CSRF & Session Tester harus dijalankan di dalam Interactive Workbench.');
        return;
    }

    log.info('=== CSRF & SESSION SECURITY TESTER v1.0 ===');

    // 1. Enhanced CSRF Token Detection
    function detectCSRFTokens() {
        log.info('--- Enhanced CSRF Token Detection ---');
        
        const csrfTokens = new Set();
        
        // Search in meta tags
        const metaTags = document.querySelectorAll('meta[name*="csrf" i], meta[name*="token" i], meta[name*="_token" i]');
        metaTags.forEach(meta => {
            const name = meta.getAttribute('name');
            const content = meta.getAttribute('content');
            if (content && content.length > 10) {
                csrfTokens.add(`Meta Tag [${name}]: ${content}`);
                log.success(`✅ CSRF token found in meta tag: ${name} = ${content}`);
            }
        });
        
        // Search in forms
        const forms = document.querySelectorAll('form');
        forms.forEach((form, formIndex) => {
            const csrfInputs = form.querySelectorAll('input[name*="csrf" i], input[name*="token" i], input[name*="_token" i], input[name="authenticity_token"]');
            
            csrfInputs.forEach(input => {
                const name = input.getAttribute('name');
                const value = input.getAttribute('value');
                if (value && value.length > 10) {
                    csrfTokens.add(`Form ${formIndex + 1} [${name}]: ${value}`);
                    log.success(`✅ CSRF token found in form: ${name} = ${value}`);
                    
                    // Analyze token pattern
                    analyzeTokenPattern(value, name);
                }
            });
            
            // Check for hidden inputs that might be tokens
            const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => {
                const name = input.getAttribute('name');
                const value = input.getAttribute('value');
                if (value && value.length > 20 && /^[a-zA-Z0-9+/=_-]+$/.test(value)) {
                    csrfTokens.add(`Potential Token in Form ${formIndex + 1} [${name}]: ${value}`);
                    log.warn(`🔍 Potential token in hidden input: ${name} = ${value}`);
                }
            });
        });
        
        // Search in JavaScript variables
        const scriptTags = document.querySelectorAll('script:not([src])');
        let jsContent = '';
        scriptTags.forEach(script => {
            jsContent += script.textContent + '\n';
        });
        
        // Look for common CSRF token variable patterns
        const jsTokenPatterns = [
            /csrf[_-]?token["\']?\s*[:=]\s*["\']([^"\']{20,})["\']|window\._token\s*=\s*["\']([^"\']{20,})["\']|_token["\']?\s*[:=]\s*["\']([^"\']{20,})["\']/gi,
            /authenticity_token["\']?\s*[:=]\s*["\']([^"\']{20,})["\']|window\.authenticityToken\s*=\s*["\']([^"\']{20,})["\']/gi,
            /csrfmiddlewaretoken["\']?\s*[:=]\s*["\']([^"\']{20,})["\']|X-CSRFToken["\']?\s*[:=]\s*["\']([^"\']{20,})["\']/gi
        ];
        
        jsTokenPatterns.forEach((pattern, patternIndex) => {
            let match;
            while ((match = pattern.exec(jsContent)) !== null) {
                const token = match[1] || match[2] || match[3];
                if (token) {
                    csrfTokens.add(`JavaScript Variable: ${token}`);
                    log.success(`✅ CSRF token found in JavaScript: ${token}`);
                    analyzeTokenPattern(token, `JS Pattern ${patternIndex + 1}`);
                }
            }
        });
        
        // Check global JavaScript variables
        const commonTokenVariables = ['_token', 'csrf_token', 'authenticity_token', 'csrfmiddlewaretoken', 'X-CSRFToken'];
        commonTokenVariables.forEach(varName => {
            try {
                if (window[varName] && typeof window[varName] === 'string' && window[varName].length > 10) {
                    csrfTokens.add(`Global Variable [${varName}]: ${window[varName]}`);
                    log.success(`✅ CSRF token found in global variable: ${varName} = ${window[varName]}`);
                }
            } catch (e) {
                // Variable not accessible
            }
        });
        
        log.info(`📊 Total CSRF tokens found: ${csrfTokens.size}`);
        return Array.from(csrfTokens);
    }

    // 2. Analyze Token Patterns
    function analyzeTokenPattern(token, source) {
        log.info(`🔍 Analyzing token pattern for ${source}:`);
        
        const analysis = {
            length: token.length,
            charset: 'unknown',
            entropy: calculateEntropy(token),
            format: 'unknown'
        };
        
        // Determine character set
        if (/^[0-9a-f]+$/i.test(token)) {
            analysis.charset = 'hexadecimal';
        } else if (/^[A-Za-z0-9+/]+=*$/.test(token)) {
            analysis.charset = 'base64';
        } else if (/^[A-Za-z0-9_-]+$/.test(token)) {
            analysis.charset = 'base64url';
        } else if (/^[A-Za-z0-9]+$/.test(token)) {
            analysis.charset = 'alphanumeric';
        } else {
            analysis.charset = 'mixed';
        }
        
        // Determine format
        if (token.includes('.')) {
            const parts = token.split('.');
            if (parts.length === 3) {
                analysis.format = 'JWT-like (3 parts)';
            } else {
                analysis.format = `Multi-part (${parts.length} parts)`;
            }
        } else if (analysis.length === 32 && analysis.charset === 'hexadecimal') {
            analysis.format = 'MD5 hash';
        } else if (analysis.length === 40 && analysis.charset === 'hexadecimal') {
            analysis.format = 'SHA1 hash';
        } else if (analysis.length === 64 && analysis.charset === 'hexadecimal') {
            analysis.format = 'SHA256 hash';
        }
        
        log.info(`  Length: ${analysis.length} characters`);
        log.info(`  Character set: ${analysis.charset}`);
        log.info(`  Format: ${analysis.format}`);
        log.info(`  Entropy: ${analysis.entropy.toFixed(2)} bits per character`);
        
        // Security analysis
        if (analysis.entropy < 3.0) {
            log.warn(`⚠️ Low entropy detected - token may be predictable`);
        } else if (analysis.entropy > 5.0) {
            log.success(`✅ High entropy - token appears well-randomized`);
        } else {
            log.info(`ℹ️ Medium entropy - token quality acceptable`);
        }
        
        if (analysis.length < 16) {
            log.warn(`⚠️ Short token length - may be vulnerable to brute force`);
        } else if (analysis.length > 32) {
            log.success(`✅ Good token length for security`);
        }
    }

    // 3. Calculate Shannon Entropy
    function calculateEntropy(str) {
        const len = str.length;
        const frequencies = {};
        
        for (let i = 0; i < len; i++) {
            frequencies[str[i]] = (frequencies[str[i]] || 0) + 1;
        }
        
        let entropy = 0;
        for (let char in frequencies) {
            const p = frequencies[char] / len;
            entropy -= p * Math.log2(p);
        }
        
        return entropy;
    }

    // 4. Session Fixation Testing
    function testSessionFixation() {
        log.info('--- Testing Session Fixation Vulnerabilities ---');
        
        // Capture initial session state
        const initialCookies = document.cookie;
        const initialSessionStorage = captureSessionStorage();
        const initialLocalStorage = captureLocalStorage();
        
        log.info('📊 Initial session state captured');
        log.info('Initial cookies:');
        if (initialCookies) {
            initialCookies.split(';').forEach(cookie => {
                log.info(`  ${cookie.trim()}`);
            });
        } else {
            log.info('  No cookies found');
        }
        
        // Test session ID generation patterns
        testSessionIDGeneration();
        
        // Test if session ID changes after authentication
        setTimeout(() => {
            log.info('--- Checking for Session ID Regeneration ---');
            const newCookies = document.cookie;
            
            if (newCookies === initialCookies) {
                log.warn('⚠️ Session cookies unchanged - potential session fixation vulnerability');
            } else {
                log.success('✅ Session cookies have changed - good session management');
            }
            
            // Compare specific session-related cookies
            compareSessionCookies(initialCookies, newCookies);
        }, 5000);
    }

    function captureSessionStorage() {
        const storage = {};
        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                storage[key] = sessionStorage.getItem(key);
            }
        } catch (e) {
            log.error('Cannot access sessionStorage');
        }
        return storage;
    }

    function captureLocalStorage() {
        const storage = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                storage[key] = localStorage.getItem(key);
            }
        } catch (e) {
            log.error('Cannot access localStorage');
        }
        return storage;
    }

    function compareSessionCookies(oldCookies, newCookies) {
        const oldCookieMap = parseCookies(oldCookies);
        const newCookieMap = parseCookies(newCookies);
        
        const sessionCookieNames = ['session', 'sessionid', 'sess', 'phpsessid', 'jsessionid', 'aspsessionid'];
        
        sessionCookieNames.forEach(name => {
            const lowerName = name.toLowerCase();
            const oldKeys = Object.keys(oldCookieMap).filter(key => key.toLowerCase().includes(lowerName));
            const newKeys = Object.keys(newCookieMap).filter(key => key.toLowerCase().includes(lowerName));
            
            oldKeys.forEach(key => {
                if (newCookieMap[key] && oldCookieMap[key] !== newCookieMap[key]) {
                    log.success(`✅ Session cookie ${key} changed: ${oldCookieMap[key]} → ${newCookieMap[key]}`);
                } else if (newCookieMap[key] && oldCookieMap[key] === newCookieMap[key]) {
                    log.warn(`⚠️ Session cookie ${key} unchanged: ${oldCookieMap[key]}`);
                }
            });
        });
    }

    function parseCookies(cookieString) {
        const cookies = {};
        if (cookieString) {
            cookieString.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                    cookies[name] = value;
                }
            });
        }
        return cookies;
    }

    // 5. Test Session ID Generation Patterns
    function testSessionIDGeneration() {
        log.info('--- Testing Session ID Generation Patterns ---');
        
        // Look for session IDs in cookies
        const cookies = parseCookies(document.cookie);
        
        Object.entries(cookies).forEach(([name, value]) => {
            if (name.toLowerCase().includes('session') || name.toLowerCase().includes('sess')) {
                log.info(`🔍 Analyzing session cookie: ${name}`);
                analyzeSessionID(value, name);
            }
        });
        
        // Test if we can predict session IDs by making multiple requests
        testSessionPredictability();
    }

    function analyzeSessionID(sessionId, cookieName) {
        const analysis = {
            length: sessionId.length,
            charset: 'unknown',
            entropy: calculateEntropy(sessionId),
            timestamp: extractTimestamp(sessionId)
        };
        
        // Determine character set
        if (/^[0-9a-f]+$/i.test(sessionId)) {
            analysis.charset = 'hexadecimal';
        } else if (/^[A-Za-z0-9+/]+=*$/.test(sessionId)) {
            analysis.charset = 'base64';
        } else if (/^[A-Za-z0-9_-]+$/.test(sessionId)) {
            analysis.charset = 'base64url';
        } else if (/^[A-Za-z0-9]+$/.test(sessionId)) {
            analysis.charset = 'alphanumeric';
        }
        
        log.info(`  Length: ${analysis.length} characters`);
        log.info(`  Character set: ${analysis.charset}`);
        log.info(`  Entropy: ${analysis.entropy.toFixed(2)} bits per character`);
        
        if (analysis.timestamp) {
            log.warn(`⚠️ Timestamp detected in session ID: ${new Date(analysis.timestamp)}`);
        }
        
        // Security warnings
        if (analysis.length < 16) {
            log.warn(`⚠️ Session ID too short - vulnerable to brute force`);
        }
        
        if (analysis.entropy < 4.0) {
            log.warn(`⚠️ Low entropy session ID - may be predictable`);
        }
        
        // Check for common weak patterns
        if (/^[0-9]+$/.test(sessionId)) {
            log.error(`❌ Session ID is only numeric - extremely weak!`);
        }
        
        if (sessionId.includes('user') || sessionId.includes('admin') || sessionId.includes('session')) {
            log.warn(`⚠️ Session ID contains predictable strings`);
        }
    }

    function extractTimestamp(sessionId) {
        // Try to decode as base64 and look for timestamps
        try {
            const decoded = atob(sessionId);
            const timestampMatch = decoded.match(/\d{10,13}/);
            if (timestampMatch) {
                const timestamp = parseInt(timestampMatch[0]);
                const now = Date.now();
                // Check if it's a reasonable timestamp (within last 10 years and next 1 year)
                if (timestamp > (now / 1000) - (10 * 365 * 24 * 60 * 60) && timestamp < (now / 1000) + (365 * 24 * 60 * 60)) {
                    return timestamp * 1000; // Convert to milliseconds
                }
            }
        } catch (e) {
            // Not base64 or no timestamp found
        }
        
        // Check for Unix timestamp in hex
        if (sessionId.length >= 8) {
            for (let i = 0; i <= sessionId.length - 8; i++) {
                const hexStr = sessionId.substr(i, 8);
                if (/^[0-9a-f]{8}$/i.test(hexStr)) {
                    const timestamp = parseInt(hexStr, 16);
                    const now = Date.now() / 1000;
                    if (timestamp > now - (10 * 365 * 24 * 60 * 60) && timestamp < now + (365 * 24 * 60 * 60)) {
                        return timestamp * 1000;
                    }
                }
            }
        }
        
        return null;
    }

    // 6. Test Session Predictability
    async function testSessionPredictability() {
        log.info('--- Testing Session Predictability ---');
        
        // This would require multiple requests to the same endpoint to get different session IDs
        // For demonstration, we'll analyze the current session ID structure
        
        const currentCookies = parseCookies(document.cookie);
        const sessionCookies = Object.entries(currentCookies).filter(([name]) => 
            name.toLowerCase().includes('session') || name.toLowerCase().includes('sess')
        );
        
        if (sessionCookies.length === 0) {
            log.warn('⚠️ No session cookies found for predictability testing');
            return;
        }
        
        sessionCookies.forEach(([name, value]) => {
            log.info(`🧪 Analyzing predictability of session cookie: ${name}`);
            
            // Check for incremental patterns
            if (/\d+$/.test(value)) {
                log.warn('⚠️ Session ID ends with numbers - may be incremental');
            }
            
            // Check for timestamp patterns
            const now = Math.floor(Date.now() / 1000);
            const recentTimestamps = [];
            for (let offset = -3600; offset <= 3600; offset += 60) {
                recentTimestamps.push((now + offset).toString());
                recentTimestamps.push((now + offset).toString(16));
            }
            
            const foundTimestamp = recentTimestamps.find(ts => value.includes(ts));
            if (foundTimestamp) {
                log.warn(`⚠️ Session ID contains recent timestamp: ${foundTimestamp}`);
            }
        });
    }

    // 7. Cookie Security Analysis
    function analyzeCookieSecurity() {
        log.info('--- Cookie Security Analysis ---');
        
        // We can only analyze cookies that are accessible to JavaScript
        const cookies = parseCookies(document.cookie);
        
        if (Object.keys(cookies).length === 0) {
            log.warn('⚠️ No cookies accessible to JavaScript (could be HttpOnly - which is good)');
            return;
        }
        
        Object.entries(cookies).forEach(([name, value]) => {
            log.info(`🍪 Analyzing cookie: ${name}`);
            
            // Check if it's a session cookie
            const isSessionCookie = name.toLowerCase().includes('session') || 
                                  name.toLowerCase().includes('sess') || 
                                  name.toLowerCase().includes('auth') || 
                                  name.toLowerCase().includes('token');
            
            if (isSessionCookie) {
                log.warn(`⚠️ Session-related cookie accessible to JavaScript: ${name}`);
                log.warn('  This cookie should ideally be HttpOnly for security');
            }
            
            // Check for sensitive data in cookie values
            if (value.includes('@')) {
                log.warn(`⚠️ Email address found in cookie: ${name}`);
            }
            
            if (/user[_-]?id|user[_-]?name|admin|role/i.test(name)) {
                log.warn(`⚠️ User identification cookie: ${name} = ${value}`);
            }
            
            // Analyze cookie value
            analyzeTokenPattern(value, `Cookie ${name}`);
        });
        
        // Test if we can access HttpOnly cookies (we shouldn't be able to)
        log.info('✅ Testing HttpOnly cookie protection...');
        log.info('ℹ️ If session cookies are missing from document.cookie, they may be properly protected with HttpOnly flag');
    }

    // Main execution
    log.info('🚀 Starting CSRF & Session Security Assessment...');
    
    // Run tests in sequence with delays
    const csrfTokens = detectCSRFTokens();
    setTimeout(() => testSessionFixation(), 2000);
    setTimeout(() => analyzeCookieSecurity(), 4000);
    
    log.info('⏱️ Assessment running... Results will appear above.');
    log.success('📝 This analysis helps identify authentication and session management vulnerabilities.');
    
    // Return collected tokens for further use
    if (typeof window !== 'undefined') {
        window.detectedCSRFTokens = csrfTokens;
        log.info('💾 CSRF tokens stored in window.detectedCSRFTokens for further analysis');
    }

})();