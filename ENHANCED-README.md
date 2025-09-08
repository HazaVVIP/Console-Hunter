# Console Hunter - Enhanced Bug Hunting Workbench

Console Hunter adalah workbench interaktif untuk bug hunting yang dapat dimuat sebagai blob ke dalam halaman target untuk melakukan pengujian keamanan.

## 🎯 Tujuan Utama

Workbench ini dirancang untuk:
1. **Pengujian Halaman Induk**: Menguji komunikasi dan kerentanan dengan parent window
2. **Deteksi Kerentanan Server/Backend**: Mengidentifikasi SSRF, injection, dan kerentanan server-side
3. **Analisis Keamanan Client-Side**: Menginspeksi DOM, session, cookie, dan storage
4. **Bypass Security Controls**: Menguji CSP bypass, frame-busting, dan kontrol keamanan lainnya

## 📋 Daftar Tools yang Tersedia

### Tools Original
1. **DOM-Extractor.js** - Mengekstrak dan menampilkan snapshot DOM halaman
2. **Firebase-Token-Exfiltrator.js** - Mencegat dan mencuri Firebase authentication tokens
3. **deep-inspector.js** - Menginspeksi properti window object secara mendalam
4. **prompt_injection.js** - Menguji kerentanan prompt injection untuk AI/API
5. **ekstrak-data-webhook.js** - Mengumpulkan dan mengirim data ke webhook external
6. **tokenid.js** - Live impersonation attack untuk pencurian identitas
7. **screenshot.js** - Mengambil screenshot halaman
8. **audio.js** - Manipulasi dan testing audio features
9. **scan-ip.js** - Network scanning dan IP detection
10. **crash.js** - Testing aplikasi crash dan DoS
11. **dashboard.js** - Dashboard monitoring dan reporting
12. **cek-up.js** - Health check dan system monitoring
13. **Object.keys(window).js** - Enumerasi window object properties

### Tools Baru (Enhanced Features)

#### 14. **parent-page-inspector.js** - Parent Page Security Tester
**Fungsi:**
- Menguji akses ke parent window dan komunikasi cross-frame
- Deteksi dan exploit kerentanan postMessage
- Ekstraksi data sensitif dari parent DOM (CSRF tokens, API keys, JWT, dll)
- Testing CSP bypass dengan blob context
- Frame-busting bypass detection
- Analisis cookie dan session storage

**Cara Penggunaan:**
```javascript
// Load dan jalankan inspector
fetch('http://localhost:8080/parent-page-inspector.js')
  .then(response => response.text())
  .then(code => eval(code));
```

**Target Kerentanan:**
- Same-origin policy bypass
- postMessage vulnerabilities
- CSRF token extraction
- Session fixation
- CSP bypass via blob loading

#### 15. **websocket-network-inspector.js** - Advanced Network Analysis
**Fungsi:**
- Intercept dan inspeksi koneksi WebSocket
- SSRF vulnerability testing (Cloud metadata, internal services)
- HTTP header analysis dan security header detection
- Port scanning (terbatas oleh CORS)
- DNS rebinding attack testing
- Sensitive data detection dalam network traffic

**Cara Penggunaan:**
```javascript
// Load network inspector
fetch('http://localhost:8080/websocket-network-inspector.js')
  .then(response => response.text())
  .then(code => eval(code));
```

**Target Kerentanan:**
- SSRF ke AWS/GCP/Azure metadata services
- Internal network service discovery
- WebSocket message interception
- Information disclosure via headers
- DNS rebinding attacks

#### 16. **csrf-session-tester.js** - CSRF & Session Security Analysis
**Fungsi:**
- Enhanced CSRF token detection (meta tags, forms, JavaScript variables)
- Token pattern analysis (entropy calculation, format detection)
- Session fixation vulnerability testing
- Session ID generation pattern analysis
- Cookie security analysis (HttpOnly, Secure flags)
- Session predictability testing

**Cara Penggunaan:**
```javascript
// Load CSRF & session tester
fetch('http://localhost:8080/csrf-session-tester.js')
  .then(response => response.text())
  .then(code => eval(code));
```

**Target Kerentanan:**
- CSRF token extraction dan analysis
- Weak session ID generation
- Session fixation vulnerabilities
- Insecure cookie handling
- Predictable session patterns

## 🚀 Cara Penggunaan

### 1. Standalone Usage
```bash
# Start local server
python3 -m http.server 8080

# Open workbench
http://localhost:8080/_Console.html
```

### 2. Blob Loading (Recommended untuk Bug Hunting)
```javascript
// Pada target website, inject kode ini:
fetch('https://your-server.com/_Console.html')
  .then(response => response.text())
  .then(html => {
    const blob = new Blob([html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #ccc';
    document.body.appendChild(iframe);
  });
```

### 3. Quick Tool Loading
```javascript
// Template untuk memuat tool individual
async function loadTool(toolName) {
    try {
        const response = await fetch(`http://localhost:8080/${toolName}.js`);
        const code = await response.text();
        eval(code);
        log.success(`${toolName} loaded successfully!`);
    } catch (error) {
        log.error(`Failed to load ${toolName}: ${error.message}`);
    }
}

// Contoh penggunaan:
loadTool('parent-page-inspector');
loadTool('websocket-network-inspector');
loadTool('csrf-session-tester');
```

## 🎯 Skenario Bug Hunting

### Skenario 1: Parent Page Exploitation
1. Load workbench sebagai blob di target site
2. Jalankan `parent-page-inspector.js`
3. Analisis hasil untuk:
   - CSRF tokens yang dapat diextract
   - postMessage vulnerabilities
   - Same-origin policy bypass
   - Session/cookie data exposure

### Skenario 2: Internal Network Discovery
1. Load `websocket-network-inspector.js`
2. Test SSRF endpoints:
   - AWS metadata: `http://169.254.169.254/latest/meta-data/`
   - GCP metadata: `http://metadata.google.internal/computeMetadata/v1/`
   - Internal services: `http://127.0.0.1:3306`, `http://10.0.0.1`, etc.
3. Analisis response untuk information disclosure

### Skenario 3: Authentication Bypass
1. Load `csrf-session-tester.js`
2. Extract dan analisis CSRF tokens
3. Test session fixation vulnerabilities
4. Analisis session ID patterns untuk predictability
5. Gunakan hasil untuk crafting bypass attacks

### Skenario 4: Comprehensive Assessment
```javascript
// Full assessment script
async function runFullAssessment() {
    const tools = [
        'parent-page-inspector',
        'websocket-network-inspector', 
        'csrf-session-tester',
        'DOM-Extractor',
        'deep-inspector'
    ];
    
    for (const tool of tools) {
        await loadTool(tool);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait between tools
    }
    
    log.success('🎉 Full security assessment completed!');
}

runFullAssessment();
```

## ⚠️ Peringatan Keamanan

**PENTING**: Tools ini dirancang khusus untuk:
- Authorized penetration testing
- Bug bounty hunting dengan scope yang jelas
- Security research dan educational purposes
- Internal security assessment

**DILARANG** menggunakan tools ini untuk:
- Unauthorized access ke sistem
- Malicious attacks atau criminal activities
- Violation terhadap terms of service
- Testing tanpa explicit permission

## 📊 Output dan Reporting

Workbench menggunakan color-coded logging:
- `log.info()` - Informasi umum (biru)
- `log.success()` - Operasi berhasil (hijau)
- `log.warn()` - Peringatan atau finding (kuning)
- `log.error()` - Error atau security issue (merah)

Semua hasil testing disimpan dalam output area workbench dan dapat di-copy untuk reporting.

## 🔧 Customization

### Menambah Tool Baru
1. Buat file `.js` baru dengan struktur:
```javascript
(function() {
    if (typeof log === 'undefined') {
        console.error('ERROR: Tool harus dijalankan di dalam Interactive Workbench.');
        return;
    }
    
    log.info('=== YOUR TOOL NAME ===');
    
    // Your tool logic here
    
})();
```

2. Tambahkan ke daftar tools dan dokumentasi

### Network Interception
Workbench sudah include network interceptor untuk fetch() requests. Untuk menambah interceptor lain:
```javascript
// Example: XMLHttpRequest interceptor
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    // Add your interception logic
    return xhr;
};
```

## 📝 Changelog

### v1.0 Enhancement
- ✅ Added Parent Page Inspector untuk parent window testing
- ✅ Added WebSocket & Network Inspector untuk SSRF dan network analysis  
- ✅ Added CSRF & Session Tester untuk authentication security
- ✅ Enhanced documentation dan usage guides
- ✅ Added color-coded logging dan better output formatting
- ✅ Improved error handling dan user experience

---

**Happy Bug Hunting! 🕷️🔍**