// Spawns a new, permanent "Super Workbench" in a popup window.
// Fixed: escaped template interpolations so the outer template literal
// doesn't try to evaluate inner ${...} sequences (this caused the
// "Unexpected identifier '$'" SyntaxError).
//
// This file is the same modified workbench (no Firebase, added download,
// persistent history, network/XHR instrumentation, console mirror, etc.),
// but with all inner "${" occurrences escaped as "\${" inside the
// fullWorkbenchHTML string so the inner scripts are preserved verbatim.

(function() {
  console.log("Mempersiapkan peluncuran 'Super Workbench' versi FIXED...");

  const fullWorkbenchHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SUPER WORKBENCH [v7 - Popup Context - No Firebase]</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/theme/dracula.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/javascript/javascript.min.js"><\/script>

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
        body { margin: 0; padding: 10px; background-color: #3c1e1e; display: flex; flex-direction: column; height: calc(100vh - 20px); font-family: var(--font-family); color: var(--text-color); }
        .top-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
        .output-area { flex: 1; width: 100%; box-sizing: border-box; background-color: var(--editor-bg); color: var(--text-color); font-size: 14px; border: 1px solid var(--border-color); padding: 10px; margin-bottom: 10px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word; }
        .CodeMirror { height: 200px; font-size: 14px; border: 1px solid #666; margin-bottom: 10px; resize: vertical; overflow: auto; }
        .button-container { display: flex; gap: 10px; flex-wrap:wrap; }
        .btn { padding: 8px 12px; color: white; border: none; font-size: 14px; cursor: pointer; transition: background-color 0.15s; border-radius: 4px; }
        .btn-execute { flex-grow: 1; background-color: var(--button-primary-bg); }
        .btn-clear { background-color: var(--button-secondary-bg); }
        .btn-download { background-color: #28a745; }
        .btn-json { background-color: #6f42c1; }
        .btn-copy { background-color: #17a2b8; }
        .btn-toggle { background-color: #ffc107; color: #111; }
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
        .btn-copy-url { color: var(--color-info); cursor: pointer; font-size: 12px; white-space: nowrap; padding: 5px 10px; border-radius: 3px; background-color: #3c3c3c; border: none; flex-shrink: 0; }
        .controls-left { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .search-box { padding:6px 8px; border-radius:4px; border:1px solid #555; background:#222; color:var(--text-color); }
        .small { font-size:12px; padding:6px 8px; }
    </style>
</head>
<body>
    <div class="top-row">
        <div class="controls-left">
            <button id="clearButton" class="btn btn-clear small">Clear</button>
            <button id="downloadButton" class="btn btn-download small">Download Output (.txt)</button>
            <button id="downloadJSONButton" class="btn btn-json small">Export Logs (.json)</button>
            <button id="copyButton" class="btn btn-copy small">Copy Output</button>
            <button id="toggleTimestamps" class="btn btn-toggle small">Toggle Timestamps</button>
        </div>
        <div style="margin-left:auto; display:flex; gap:8px; align-items:center;">
            <input id="searchInput" class="search-box" placeholder="Filter output (regex)" />
            <button id="applyFilter" class="btn small">Apply</button>
            <button id="clearFilter" class="btn small">Clear</button>
        </div>
    </div>

    <div id="outputArea" class="output-area" aria-live="polite"></div>
    <textarea id="inputArea"></textarea>
    <div class="button-container" style="margin-top:8px;">
        <button id="executeButton" class="btn btn-execute">Execute (Ctrl+Enter)</button>
        <button id="historyButton" class="btn btn-clear">History</button>
    </div>

    <script>
      // Minimal utilities
      const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    <\/script>

    <script>
        (function() {
            const outputArea = document.getElementById('outputArea');
            const executeButton = document.getElementById('executeButton');
            const clearButton = document.getElementById('clearButton');
            const downloadButton = document.getElementById('downloadButton');
            const downloadJSONButton = document.getElementById('downloadJSONButton');
            const copyButton = document.getElementById('copyButton');
            const toggleTimestampsBtn = document.getElementById('toggleTimestamps');
            const searchInput = document.getElementById('searchInput');
            const applyFilterBtn = document.getElementById('applyFilter');
            const clearFilterBtn = document.getElementById('clearFilter');
            const historyButton = document.getElementById('historyButton');

            const editor = CodeMirror.fromTextArea(document.getElementById('inputArea'), {
                lineNumbers: true, mode: "javascript", theme: "dracula",
                autofocus: true, lineWrapping: true,
                extraKeys: { "Ctrl-Enter": (cm) => executeCommand(), "Ctrl-S": () => downloadOutputText() }
            });

            // Persistent command history
            const HISTORY_KEY = 'super_workbench_command_history_v1';
            const LOGS_KEY = 'super_workbench_logs_v1';
            let commandHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            let historyIndex = commandHistory.length;
            let showTimestamps = true;
            let allLogEntries = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'); // persisted logs
            let netLogs = []; // separate structure for network entries

            // Render persisted logs on load
            function renderPersisted() {
                if (allLogEntries && allLogEntries.length) {
                    allLogEntries.forEach(entry => {
                        appendLogElement(entry, false);
                    });
                }
            }

            // Main log object
            const log = {
                _createEntry: (level, message) => {
                    const ts = new Date().toISOString();
                    const entry = { timestamp: ts, level, message: (typeof message === 'object' ? tryStringify(message) : String(message)) };
                    allLogEntries.push(entry);
                    // persist (keep last 2000 entries to be reasonable)
                    try {
                        const truncated = allLogEntries.slice(-2000);
                        localStorage.setItem(LOGS_KEY, JSON.stringify(truncated));
                    } catch (e) {
                        // ignore storage errors
                    }
                    return entry;
                },
                _append: (message, color, prefix = '', level = 'info') => {
                    const entry = log._createEntry(level, message);
                    entry.color = color;
                    entry.prefix = prefix;
                    appendLogElement(entry, true);
                },
                info: (msg) => log._append(msg, 'var(--color-info)', '', 'info'),
                success: (msg) => log._append(msg, 'var(--color-success)', '✅', 'success'),
                warn: (msg) => log._append(msg, 'var(--color-warn)', '⚠️', 'warn'),
                error: (msg) => log._append(msg, 'var(--color-error)', '❌', 'error'),
                network: (method, urlString, details = {}) => {
                    const ts = new Date().toISOString();
                    const netEntry = { timestamp: ts, type: 'network', method, url: urlString, details };
                    netLogs.push(netEntry);
                    allLogEntries.push({ timestamp: ts, level: 'network', message: method + ' ' + urlString, details });
                    appendNetworkElement(netEntry);
                    try { localStorage.setItem(LOGS_KEY, JSON.stringify(allLogEntries.slice(-2000))); } catch(e){}
                }
            };

            function tryStringify(obj) {
                try { return JSON.stringify(obj, null, 2); } catch(e) { return String(obj); }
            }

            // Append a generic log element
            function appendLogElement(entry, scrollIntoView = true) {
                const line = document.createElement('div');
                const timePart = showTimestamps ? '[' + entry.timestamp + '] ' : '';
                line.textContent = (entry.prefix ? entry.prefix + ' ' : '') + timePart + entry.message;
                line.style.color = entry.color || 'var(--text-color)';
                line.dataset.level = entry.level || 'info';
                outputArea.appendChild(line);
                if (scrollIntoView) outputArea.scrollTop = outputArea.scrollHeight;
            }

            // Append a network entry (specialized)
            function appendNetworkElement(netEntry) {
                const entry = document.createElement('div');
                entry.className = 'net-log-entry';
                const header = document.createElement('div');
                header.className = 'net-log-header';
                const infoContainer = document.createElement('div');
                infoContainer.className = 'net-log-info';

                let baseUrl = netEntry.url, params = '';
                try { const u = new URL(netEntry.url); baseUrl = u.origin + u.pathname; params = u.search || ''; } catch(e){}

                const baseSpan = document.createElement('span');
                baseSpan.innerHTML = '<span class="method">[NET] ' + escapeHTML(netEntry.method) + '</span><span class="url-base"> ' + escapeHTML(baseUrl) + '</span>';
                const meta = document.createElement('div');
                meta.style.fontSize = '12px';
                meta.style.marginTop = '4px';
                meta.textContent = showTimestamps ? ('[' + netEntry.timestamp + ']') : '';
                infoContainer.appendChild(baseSpan);
                infoContainer.appendChild(meta);

                if (params) {
                    const paramsBox = document.createElement('div');
                    paramsBox.className = 'net-log-params-box';
                    paramsBox.textContent = params;
                    infoContainer.appendChild(paramsBox);
                }
                // details payload preview
                if (netEntry.details && Object.keys(netEntry.details).length) {
                    const detailsBox = document.createElement('div');
                    detailsBox.className = 'net-log-params-box';
                    detailsBox.style.marginTop = '6px';
                    detailsBox.style.backgroundColor = '#161616';
                    detailsBox.textContent = tryStringify(netEntry.details);
                    infoContainer.appendChild(detailsBox);
                }

                const copyButton = document.createElement('button');
                copyButton.className = 'btn-copy-url';
                copyButton.textContent = '[ Copy URL ]';
                copyButton.onclick = async () => {
                    try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(netEntry.url);
                        } else {
                            const tempInput = document.createElement('textarea');
                            tempInput.style.position = 'absolute';
                            tempInput.style.left = '-9999px';
                            tempInput.value = netEntry.url;
                            document.body.appendChild(tempInput);
                            tempInput.select();
                            document.execCommand('copy');
                            document.body.removeChild(tempInput);
                        }
                        copyButton.textContent = '[ Copied! ]';
                        setTimeout(() => { copyButton.textContent = '[ Copy URL ]'; }, 1500);
                    } catch (err) {
                        copyButton.textContent = '[ Failed! ]';
                        setTimeout(() => { copyButton.textContent = '[ Copy URL ]'; }, 1500);
                    }
                };

                header.appendChild(infoContainer);
                header.appendChild(copyButton);
                entry.appendChild(header);
                outputArea.appendChild(entry);
                outputArea.scrollTop = outputArea.scrollHeight;
            }

            // Mirror console to output area
            (function hijackConsole() {
                const orig = { log: console.log, info: console.info, warn: console.warn, error: console.error };
                console.log = function(...args){ orig.log.apply(console, args); log.info(args.length>1?args:args[0]); };
                console.info = function(...args){ orig.info.apply(console, args); log.info(args.length>1?args:args[0]); };
                console.warn = function(...args){ orig.warn.apply(console, args); log.warn(args.length>1?args:args[0]); };
                console.error = function(...args){ orig.error.apply(console, args); log.error(args.length>1?args:args[0]); };
            })();

            // Network instrumentation: fetch + XHR
            (function instrumentNetwork() {
                const originalFetch = window.fetch;
                window.fetch = async function(...args) {
                    try {
                        let url, method;
                        if (typeof args[0] === 'string') { url = args[0]; method = args[1]?.method?.toUpperCase() || 'GET'; }
                        else if (args[0] instanceof Request) { url = args[0].url; method = args[0].method?.toUpperCase() || 'GET'; }
                        else { return originalFetch.apply(this, args); }
                        log.network(method, url, { via: 'fetch' });
                    } catch(e){}
                    return originalFetch.apply(this, args);
                };

                // XHR
                const OriginalXHR = window.XMLHttpRequest;
                function XHRProxy() {
                    const xhr = new OriginalXHR();
                    let _url = null;
                    const open = xhr.open;
                    xhr.open = function(method, url, ...rest) {
                        _url = url;
                        try { log.network(method, url, { via: 'xhr' }); } catch(e){}
                        return open.call(this, method, url, ...rest);
                    };
                    return xhr;
                }
                window.XMLHttpRequest = XHRProxy;
            })();

            // Command execution
            async function executeCommand() {
                const command = editor.getValue();
                if (!command.trim()) return;
                // push to history
                if (commandHistory[commandHistory.length - 1] !== command) {
                    commandHistory.push(command);
                    // persist
                    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(commandHistory.slice(-500))); } catch(e){}
                }
                historyIndex = commandHistory.length;
                editor.setValue('');
                try {
                    // provide helpful globals
                    const result = await eval(\`(async () => {
                        window.log = window.top && window.top.log ? window.top.log : undefined;
                        window.probe = probe;
                        window.clearLog = clearLog;
                        return (function() { \${command} })();
                    })()\`);
                    if (result !== undefined) { log.info( tryStringify(result) ); }
                } catch (err) {
                    log.error('Error: ' + (err && err.stack ? err.stack : err.message || String(err)));
                }
            }

            // Clear log
            function clearLog() {
                outputArea.innerHTML = '';
                allLogEntries = [];
                netLogs = [];
                try { localStorage.removeItem(LOGS_KEY); } catch(e){}
            }

            // Probe helper (lightweight, no firebase)
            async function probe(url, options = {}) {
                try {
                    const response = await fetch(url, options);
                    const text = await response.text();
                    const headers = {};
                    response.headers.forEach((v,k) => headers[k] = v);
                    const result = { status: response.status, headers, body: text };
                    log.success('[PROBE OK: ' + result.status + '] ' + url);
                    return result;
                } catch (err) {
                    log.error('[PROBE FAILED] ' + url + ' - ' + (err && err.message ? err.message : String(err)));
                    throw err;
                }
            }

            // Download helpers
            function downloadBlob(content, filename, mime='text/plain') {
                const blob = new Blob([content], {type: mime});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 5000);
            }

            function downloadOutputText() {
                const txt = Array.from(outputArea.childNodes).map(n => n.textContent).join('\\n');
                const ts = new Date().toISOString().replace(/[:.]/g,'-');
                downloadBlob(txt, 'super_workbench_output_' + ts + '.txt', 'text/plain');
            }

            function downloadOutputJSON() {
                const payload = { exportedAt: new Date().toISOString(), entries: allLogEntries, net: netLogs };
                const ts = new Date().toISOString().replace(/[:.]/g,'-');
                downloadBlob(JSON.stringify(payload, null, 2), 'super_workbench_logs_' + ts + '.json', 'application/json');
            }

            function copyOutputToClipboard() {
                const txt = Array.from(outputArea.childNodes).map(n => n.textContent).join('\\n');
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(txt).then(()=> {
                        log.success('Output copied to clipboard.');
                    }).catch((e) => {
                        fallbackCopy(txt);
                    });
                } else fallbackCopy(txt);
            }

            function fallbackCopy(text) {
                try {
                    const t = document.createElement('textarea');
                    t.style.position = 'absolute';
                    t.style.left = '-9999px';
                    t.value = text;
                    document.body.appendChild(t);
                    t.select();
                    document.execCommand('copy');
                    document.body.removeChild(t);
                    log.success('Output copied (fallback).');
                } catch (e) {
                    log.error('Copy failed: ' + (e && e.message ? e.message : String(e)));
                }
            }

            // Apply/clear filter
            function applyFilter() {
                const q = searchInput.value.trim();
                if (!q) return;
                let re;
                try { re = new RegExp(q, 'i'); } catch(e) { log.error('Invalid regex: ' + e.message); return; }
                // Hide non-matching nodes
                Array.from(outputArea.children).forEach(node => {
                    node.style.display = re.test(node.textContent) ? '' : 'none';
                });
            }
            function clearFilter() {
                searchInput.value = '';
                Array.from(outputArea.children).forEach(node => node.style.display = '');
            }

            // Show history modal (simple)
            function showHistory() {
                const modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.background = '#111';
                modal.style.border = '1px solid #333';
                modal.style.padding = '12px';
                modal.style.zIndex = 9999;
                modal.style.maxHeight = '70vh';
                modal.style.overflow = 'auto';
                const title = document.createElement('div');
                title.textContent = 'Command History (click to paste)';
                title.style.fontWeight = 'bold';
                title.style.marginBottom = '8px';
                modal.appendChild(title);
                commandHistory.slice().reverse().forEach((cmd, idx) => {
                    const b = document.createElement('button');
                    b.textContent = cmd.slice(0, 120).replace(/\\n/g,' ') + (cmd.length>120?'…':'');
                    b.style.display = 'block';
                    b.style.width = '100%';
                    b.style.textAlign = 'left';
                    b.style.marginBottom = '6px';
                    b.onclick = () => {
                        editor.setValue(cmd);
                        document.body.removeChild(modal);
                    };
                    modal.appendChild(b);
                });
                const close = document.createElement('button');
                close.textContent = 'Close';
                close.style.marginTop = '8px';
                close.onclick = () => document.body.removeChild(modal);
                modal.appendChild(close);
                document.body.appendChild(modal);
            }

            // Wire up events
            executeButton.addEventListener('click', executeCommand);
            clearButton.addEventListener('click', clearLog);
            downloadButton.addEventListener('click', downloadOutputText);
            downloadJSONButton.addEventListener('click', downloadOutputJSON);
            copyButton.addEventListener('click', copyOutputToClipboard);
            toggleTimestampsBtn.addEventListener('click', () => {
                showTimestamps = !showTimestamps;
                // re-render simple: clear and re-append persisted entries
                outputArea.innerHTML = '';
                allLogEntries.forEach(entry => appendLogElement(entry, false));
                netLogs.forEach(n => appendNetworkElement(n));
            });
            applyFilterBtn.addEventListener('click', applyFilter);
            clearFilterBtn.addEventListener('click', clearFilter);
            historyButton.addEventListener('click', showHistory);

            // Keyboard shortcuts for history navigation in editor
            editor.on('keydown', function(cm, e) {
                if (e.key === 'ArrowUp' && cm.getCursor().line === 0) {
                     if (historyIndex > 0) { e.preventDefault(); historyIndex--; cm.setValue(commandHistory[historyIndex]); cm.setCursor(cm.lineCount(), 0); }
                } else if (e.key === 'ArrowDown' && cm.getCursor().line === cm.lineCount() - 1) {
                    if (historyIndex < commandHistory.length - 1) { e.preventDefault(); historyIndex++; cm.setValue(commandHistory[historyIndex]); }
                }
            });

            // Load persisted state
            try { commandHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); historyIndex = commandHistory.length; } catch(e){}
            try { allLogEntries = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'); } catch(e){}
            // re-render persisted logs
            renderPersisted();

            log.success("Super Workbench [POPUP CONTEXT] is ACTIVE (No Firebase).");
            log.info("Fitur: download, export JSON, persistent history, network logging (fetch/XHR), console mirror.");

            // expose some helpers to global popup window
            window.superWorkbench = {
                log,
                probe,
                downloadOutputText,
                downloadOutputJSON,
                getLogs: () => ({ entries: allLogEntries.slice(), net: netLogs.slice() }),
                clearLog,
            };
        })();
    <\/script>
</body>
</html>
  `;

  try {
    const popupWidth = 1000;
    const popupHeight = 800;
    const newWin = window.open('', '_blank', `width=${popupWidth},height=${popupHeight},resizable=yes,scrollbars=yes`);

    if (!newWin) {
      throw new Error("Popup diblokir oleh browser. Harap izinkan popup untuk situs ini.");
    }

    newWin.document.write(fullWorkbenchHTML);
    newWin.document.close();

    console.log("✅ 'Super Workbench' (dimodifikasi, tanpa Firebase) berhasil diluncurkan di jendela popup baru.");
    console.warn("Sekarang Anda dapat menjalankan serangan interaktif / hunting dari jendela popup tersebut.");

  } catch (e) {
    console.error("Gagal meluncurkan Super Workbench:", e);
    alert("Gagal meluncurkan Super Workbench: " + e.message);
  }
})();
