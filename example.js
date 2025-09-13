function bukaKonsolPopup() {
    try {
        // Buka jendela baru yang lebih fungsional
        const newWin = window.open('', '_blank', 'width=600,height=400,resizable=yes,scrollbars=yes');
        
        if (!newWin) {
            alert('Popup diblokir oleh browser!');
            return;
        }

        // Tulis antarmuka (UI) untuk konsol ke dalam popup
        newWin.document.write(`
            <html>
            <head>
                <title>Konsol Eksekusi JS</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; margin: 8px; }
                    textarea { flex-grow: 1; margin-bottom: 5px; font-family: monospace; }
                    button { padding: 5px 10px; }
                    pre { background-color: #f4f4f4; border: 1px solid #ccc; padding: 5px; min-height: 50px; }
                </style>
            </head>
            <body>
                <h2>Konsol Eksekusi JavaScript</h2>
                <p>Masukkan payload di bawah dan klik 'Eksekusi'. Konteks <b>'window'</b> di sini adalah milik popup.</p>
                <textarea id="payload" placeholder="Contoh: alert(document.domain)"></textarea>
                <button id="eksekusiBtn">Eksekusi</button>
                <h3>Output:</h3>
                <pre id="output"></pre>

                <script>
                    document.getElementById('eksekusiBtn').addEventListener('click', function() {
                        const payload = document.getElementById('payload').value;
                        const outputEl = document.getElementById('output');
                        
                        try {
                            // Mengeksekusi payload dalam konteks popup menggunakan eval()
                            // 'eval' digunakan di sini untuk kesederhanaan PoC.
                            const result = eval(payload);
                            
                            // Menampilkan hasil atau tipe data dari hasil eksekusi
                            outputEl.textContent = 'Sukses!\\n\\nHasil: ' + result;
                        } catch (e) {
                            // Menampilkan pesan error jika eksekusi gagal
                            outputEl.textContent = 'Error!\\n\\n' + e.message;
                        }
                    });
                <\/script>
            </body>
            </html>
        `);
        newWin.document.close();
