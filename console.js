// Spawns a new, permanent "Super Workbench" in a popup window.
// This version includes the *entire* 280+ line source code of the workbench
// to ensure full functionality is preserved, as requested.
// The new workbench will run in the more privileged popup context.

(function() {
  console.log("Mempersiapkan peluncuran 'Super Workbench' versi LENGKAP...");

  // 1. Mengambil seluruh kode HTML dari interactive_workbench.html.
  //    Penting: Tag </script> di-escape menjadi <\/script> untuk mencegah
  //    terminasi skrip yang tidak semestinya.
  const fullWorkbenchHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SUPER WORKBENCH [v7 - Popup Context]</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/theme/dracula.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/javascript/javascript.min.js"><\/script>
    
    <!-- Firebase SDKs -->
    <script type="module" src="https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"><\/script>
    <script type="module" src="https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"><\/script>
    <script type="module" src="https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"><\/script>
    <script type="module" src="https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore-logger.js"><\/script>

    <style>
        :root {
            --bg-color: #1e1e1e;
            --editor-bg: #252526;
            --input-bg: #3c3c3c;
            --text-color: #d4d4d4;
            --border-color: #3c3c3c;
            --button-primary-bg: #007acc;
            --button-secondary-bg: #6c757d;
            --font-family: Consolas, 'Courier New', monospace;
            --color-info: #9cdcfe;
            --color-success: #b5cea8;
            --color-warn: #ffd700;
            --color-error: #f48771;
            --color-netlog: #c586c0;
            --color-netlog-params: #6A9955;
        }
        /* Warna latar merah gelap untuk menandakan 'super' context */
        body { margin: 0; padding: 10px; background-color: #3c1e1e; display: flex; flex-direction: column; height: calc(100vh - 20px); font-family: var(--font-family); }
        .output-area { flex: 1; width: 100%; box-sizing: border-box; background-color: var(--editor-bg); color: var(--text-color); font-size: 14px; border: 1px solid var(--border-color); padding: 10px; margin-bottom: 10px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word; }
        .CodeMirror { height: 200px; font-size: 14px; border: 1px solid #666; margin-bottom: 10px; resize: vertical; overflow: auto; }
        .button-container { display: flex; gap: 10px; }
        .btn { padding: 10px; color: white; border: none; font-size: 16px; cursor: pointer; transition: background-color 0.2s; }
        .btn-execute { flex-grow: 1; background-color: var(--button-primary-bg); }
        .btn-clear { padding: 10px 20px; background-color: var(--button-secondary-bg); }
        .net-log-entry { padding: 8px; margin: 8px 0; border: 1px solid #444; background-color: #2a2d2e; border-radius: 4px; }
        .net-log-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .net-log-info { display: flex; flex-direction: column; word-break: break-all; flex-grow: 1; }
        .net-log-header .method { font-weight: bold; color: var(--color-netlog); margin-right: 10px; }
        .net-log-header .url-base { color: var(--text-color); }
        .net-log-params-box {
            background-color: #1e1e1e;
            padding: 8px;
            margin-top: 5px;
            border-radius: 3px;
            color: var(--color-netlog-params);
            word-break: break-all;
            white-space: pre-wrap;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
        }
        .btn-copy-url {
            color: var(--color-info);
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
            padding: 5px 10px;
            border-radius: 3px;
            background-color: #3c3c3c;
            border: none;
            flex-shrink: 0;
        }
        .btn-copy-url:hover { background-color: #555; }
    </style>
</head>
<body>
    <div id="outputArea" class="output-area"></div>
    <textarea id="inputArea"><\/textarea>
    <div class="button-container">
        <button id="clearButton" class="btn btn-clear">Clear</button>
        <button id="executeButton" class="btn btn-execute">Execute (Ctrl+Enter)</button>
    </div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Variabel global akan di-resolve di dalam konteks popup
        const appId = typeof window.opener.__app_id !== 'undefined' ? window.opener.__app_id : 'default-app-id';
        const firebaseConfig = typeof window.opener.__firebase_config !== 'undefined' ? JSON.parse(window.opener.__firebase_config) : null;
        const initialAuthToken = typeof window.opener.__initial_auth_token !== 'undefined' ? window.opener.__initial_auth_token : null;
        let app, auth, db;

        (async function() {
            const outputArea = document.getElementById('outputArea');
            const executeButton = document.getElementById('executeButton');
            const clearButton = document.getElementById('clearButton');

            const editor = CodeMirror.fromTextArea(document.getElementById('inputArea'), {
                lineNumbers: true, mode: "javascript", theme: "dracula",
                autofocus: true, lineWrapping: true,
                extraKeys: { "Ctrl-Enter": (cm) => executeCommand() }
            });

            const commandHistory = [];
            let historyIndex = -1;
            
            const log = {
                _append: (message, color, prefix = '') => {
                    const line = document.createElement('div');
                    line.style.color = color;
                    if (typeof message === 'object' && message !== null) { try { message = JSON.stringify(message, null, 2); } catch (e) { message = '[Unserializable Object]'; } }
                    line.textContent = prefix ? \`\${prefix} \${message}\` : message;
                    outputArea.appendChild(line);
                    outputArea.scrollTop = outputArea.scrollHeight;
                },
                info: (msg) => log._append(msg, 'var(--color-info)'),
                success: (msg) => log._append(msg, 'var(--color-success)', '✅'),
                warn: (msg) => log._append(msg, 'var(--color-warn)', '⚠️'),
                error: (msg) => log._append(msg, 'var(--color-error)', '❌'),
                network: (method, urlString) => {
                    const entry = document.createElement('div');
                    entry.className = 'net-log-entry';
                    const header = document.createElement('div');
                    header.className = 'net-log-header';
                    const infoContainer = document.createElement('div');
                    infoContainer.className = 'net-log-info';
                    let baseUrl = urlString, params = '';
                    try { const url = new URL(urlString); baseUrl = url.origin + url.pathname; params = url.search; } catch (e) {}
                    const baseSpan = document.createElement('span');
                    baseSpan.innerHTML = \`<span class="method">[NET] \${method}</span><span class="url-base">\${baseUrl}</span>\`;
                    infoContainer.appendChild(baseSpan);
                    if (params) { const paramsBox = document.createElement('div'); paramsBox.className = 'net-log-params-box'; paramsBox.textContent = params; infoContainer.appendChild(paramsBox); }
                    const copyButton = document.createElement('button');
                    copyButton.className = 'btn-copy-url';
                    copyButton.textContent = '[ Copy URL ]';
                    copyButton.onclick = () => {
                        try {
                            const tempInput = document.createElement('textarea');
                            tempInput.style.position = 'absolute'; tempInput.style.left = '-9999px';
                            tempInput.value = urlString;
                            document.body.appendChild(tempInput);
                            tempInput.select(); document.execCommand('copy'); document.body.removeChild(tempInput);
                            copyButton.textContent = '[ Copied! ]';
                            setTimeout(() => { copyButton.textContent = '[ Copy URL ]'; }, 1500);
                        } catch (err) {
                            copyButton.textContent = '[ Failed! ]';
                            console.error('Failed to copy URL using execCommand:', err);
                            setTimeout(() => { copyButton.textContent = '[ Copy URL ]'; }, 1500);
                        }
                    };
                    header.appendChild(infoContainer); header.appendChild(copyButton);
                    entry.appendChild(header); outputArea.appendChild(entry);
                    outputArea.scrollTop = outputArea.scrollHeight;
                }
            };
            
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                let url, method;
                if (typeof args[0] === 'string') { url = args[0]; method = args[1]?.method?.toUpperCase() || 'GET'; } 
                else if (args[0] instanceof Request) { url = args[0].url; method = args[0].method.toUpperCase() || 'GET'; } 
                else { return originalFetch.apply(this, args); }
                log.network(method, url);
                return originalFetch.apply(this, args);
            };
            log.success("Super Workbench [POPUP CONTEXT] is ACTIVE.");

            function clearLog() { outputArea.innerHTML = ''; }
            
            async function probe(url, options = {}) {
                try {
                    const response = await fetch(url, options);
                    const responseText = await response.text();
                    const responseHeaders = Object.fromEntries(response.headers.entries());
                    const result = { status: response.status, headers: responseHeaders, body: responseText };
                    log.success(\`[PROBE OK: \${result.status}]\`);
                    return result;
                } catch (err) {
                    log.error(\`[PROBE GAGAL] \${url} - \${err.message}\`);
                    throw err;
                }
            }

            async function executeCommand() {
                const command = editor.getValue();
                if (!command.trim()) return;
                if (commandHistory[commandHistory.length - 1] !== command) { commandHistory.push(command); }
                historyIndex = commandHistory.length;
                editor.setValue(''); 
                try {
                    const result = await eval(\`(async () => {
                        window.log = log; window.probe = probe; window.clearLog = clearLog;
                        window.db = db; window.auth = auth;
                        return (function() { \${command} })();
                    })()\`);
                    if (result !== undefined) { log.info(result); }
                } catch (err) { log.error(\`Error: \${err.name} - \${err.message}\\n\${err.stack}\`); }
            }

            executeButton.addEventListener('click', executeCommand);
            clearButton.addEventListener('click', clearLog);
            editor.on('keydown', function(cm, e) {
                if (e.key === 'ArrowUp' && cm.getCursor().line === 0) {
                     if (historyIndex > 0) { e.preventDefault(); historyIndex--; cm.setValue(commandHistory[historyIndex]); cm.setCursor(cm.lineCount(), 0); }
                } else if (e.key === 'ArrowDown' && cm.getCursor().line === cm.lineCount() - 1) {
                    if (historyIndex < commandHistory.length - 1) { e.preventDefault(); historyIndex++; cm.setValue(commandHistory[historyIndex]); }
                }
            });

            if (firebaseConfig) {
                try {
                    app = initializeApp(firebaseConfig);
                    auth = getAuth(app);
                    db = getFirestore(app);
                    setLogLevel('debug');
                    
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        log.success('Firebase authentication successful.');
                    } else {
                        await signInAnonymously(auth);
                        log.warn('Anonymous Firebase sign-in successful.');
                    }
                } catch (err) { log.error('Firebase initialization failed: ' + err.message); }
            } else { log.warn('Firebase configuration not found. Firestore features will not be available.'); }
        })();
    <\/script>
</body>
</html>
  `;

  try {
    const popupWidth = 800;
    const popupHeight = 700;
    const newWin = window.open('', '_blank', `width=${popupWidth},height=${popupHeight},resizable=yes,scrollbars=yes`);

    if (!newWin) {
      throw new Error("Popup diblokir oleh browser. Harap izinkan popup untuk situs ini.");
    }

    newWin.document.write(fullWorkbenchHTML);
    newWin.document.close();

    console.log("✅ 'Super Workbench' (versi lengkap) berhasil diluncurkan di jendela popup baru.");
    console.warn("Sekarang Anda dapat menjalankan serangan interaktif dari jendela popup tersebut.");

  } catch (e) {
    console.error("Gagal meluncurkan Super Workbench:", e);
    alert("Gagal meluncurkan Super Workbench: " + e.message);
  }
})();
