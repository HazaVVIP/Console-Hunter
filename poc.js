(function() {
  console.log("[XSS-CONTEXT-CHECK] Memulai pengujian origin...");

  try {
    // Membuka jendela about:blank
    const testWin = window.open('about:blank', '_blank', 'width=500,height=400');
    
    if (!testWin) {
      throw new Error("Popup diblokir. Harap izinkan popup untuk pengujian ini.");
    }

    // Menulis skrip diagnostik ke jendela baru
    testWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>XSS Execution Context</title>
          <style>
            body { font-family: monospace; background: #1e1e1e; color: #00ff00; padding: 20px; }
            .info { border-bottom: 1px solid #444; margin-bottom: 10px; padding-bottom: 5px; }
            .highlight { color: #ffcc00; }
          </style>
        </head>
        <body>
          <h3>Diagnostic Results:</h3>
          <div id="results"> Menunggu data... </div>

          <script>
            window.onload = function() {
              const resultsDiv = document.getElementById('results');
              let domain, origin;

              try {
                domain = document.domain || "N/A (Unique/Null Origin)";
                origin = window.origin || "N/A";
              } catch (e) {
                domain = "Access Denied: " + e.message;
                origin = "Access Denied";
              }

              resultsDiv.innerHTML = \`
                <div class="info"><strong>Document Domain:</strong> <span class="highlight">\${domain}</span></div>
                <div class="info"><strong>Window Origin:</strong> <span class="highlight">\${origin}</span></div>
                <div class="info"><strong>Location:</strong> \${window.location.href}</div>
              \`;

              console.log("[XSS-DIAGNOSTIC]", { domain, origin });
              
              // Cek apakah berada di dalam Sandbox
              if (origin === "null" || domain.includes("N/A")) {
                resultsDiv.innerHTML += "<p style='color:red;'>[!] Terdeteksi Sandbox (Null Origin). Payload tidak memiliki akses ke domain utama.</p>";
              } else {
                resultsDiv.innerHTML += "<p style='color:cyan;'>[+] Scope Terkonfirmasi: Payload berjalan di konteks domain yang sama.</p>";
              }
            };
          <\/script>
        </body>
      </html>
    `);

    testWin.document.close();
    console.log("[XSS-CONTEXT-CHECK] Jendela diagnostik berhasil dibuka.");

  } catch (e) {
    console.error("[XSS-CONTEXT-CHECK] Gagal mengeksekusi:", e);
  }
})();
