# Console Hunter - Enhanced Bug Hunting Workbench

Console Hunter adalah workbench interaktif untuk bug hunting yang dapat dimuat sebagai blob ke dalam halaman target untuk melakukan pengujian keamanan.

## 🚀 New Features (v1.0 Enhancement)

### 1. Parent Page Inspector (`parent-page-inspector.js`)
- ✅ Test komunikasi dengan halaman induk (parent window)
- ✅ Deteksi kerentanan postMessage 
- ✅ Ekstrak data sensitif dari parent DOM (CSRF tokens, API keys, JWT)
- ✅ Test bypass CSP dengan blob loading
- ✅ Test frame-busting bypass
- ✅ Analisis cookie dan session storage

### 2. WebSocket & Network Inspector (`websocket-network-inspector.js`)
- ✅ Intercept dan inspeksi koneksi WebSocket
- ✅ SSRF vulnerability testing (AWS/GCP/Azure metadata services)
- ✅ HTTP header analysis dan security header detection
- ✅ Port scanning (terbatas oleh CORS)
- ✅ DNS rebinding attack testing
- ✅ Sensitive data detection dalam network traffic

### 3. CSRF & Session Tester (`csrf-session-tester.js`)
- ✅ Enhanced CSRF token detection (meta tags, forms, JavaScript variables)
- ✅ Token pattern analysis (entropy calculation, format detection)
- ✅ Session fixation vulnerability testing
- ✅ Session ID generation pattern analysis
- ✅ Cookie security analysis (HttpOnly, Secure flags)

### 4. Tool Loader (`tool-loader.js`)
- ✅ Easy tool management dan loading
- ✅ Predefined tool sets untuk common scenarios
- ✅ Batch loading dengan error handling
- ✅ Troubleshooting utilities

## 📋 Cara Penggunaan

### Quick Start
```javascript
// Load tool loader untuk easy management
fetch('/tool-loader.js').then(r=>r.text()).then(eval);

// Lihat daftar tools
listTools();

// Load specific tool
loadTool('parent-inspector');

// Load tool set untuk comprehensive testing
loadToolSet('full-assessment');
```

### Standalone Tool Usage
```javascript
// Load individual tools directly
fetch('/parent-page-inspector.js').then(r=>r.text()).then(eval);
fetch('/websocket-network-inspector.js').then(r=>r.text()).then(eval);
fetch('/csrf-session-tester.js').then(r=>r.text()).then(eval);
```

## 🎯 Target Kerentanan

### Parent Page Exploitation
- Same-origin policy bypass
- postMessage vulnerabilities  
- CSRF token extraction dari parent DOM
- Session fixation attacks
- CSP bypass via blob loading
- Frame-busting bypass

### Server/Backend Vulnerabilities
- SSRF ke cloud metadata services (AWS/GCP/Azure)
- Internal network service discovery
- WebSocket message interception
- Information disclosure via HTTP headers
- DNS rebinding attacks

### Authentication & Session Management
- CSRF token detection dan analysis
- Weak session ID generation
- Session fixation vulnerabilities
- Insecure cookie handling
- Predictable session patterns

## ⚠️ Security Notice
Tools ini dirancang untuk authorized penetration testing dan bug bounty hunting. Gunakan hanya dengan explicit permission pada target yang sah.

---

## Original README