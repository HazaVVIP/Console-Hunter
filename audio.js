/**
 * =============================================================================
 *  Payload v15: Audio Annunciator & Network Recon Probe
 *  (Diadaptasi untuk Interactive Workbench)
 * =============================================================================
 * Tujuan:
 * 1. Menggunakan Speech Synthesis API untuk demonstrasi output audio.
 * 2. Mencoba panggilan 'fetch' untuk menyelidiki kebijakan CSP 'connect-src'.
 * 3. Kompatibel penuh dengan lingkungan 'Interactive Workbench v13+'.
 * =============================================================================
 */

function runAudioRecon() {
    // --- Demonstrasi Audio ---
    try {
        log.info('Mencoba menggunakan Speech Synthesis API...');
        
        const message = new SpeechSynthesisUtterance();
        message.text = "System alert. Audio output is enabled on this endpoint.";
        message.lang = 'en-US';
        message.rate = 0.9;
        
        // Ucapkan pesannya
        window.speechSynthesis.speak(message);
        
        log.success('SUCCESS: SpeechSynthesisUtterance telah diantrekan. Dengarkan output audio.');
        
    } catch (err) {
        log.error(`Speech Synthesis Error: ${err.name} - ${err.message}`);
    }

    // --- Pemeriksaan Jaringan (CSP Recon) ---
    try {
        log.info("\nMencoba 'fetch' ke sumber daya publik untuk menguji CSP...");
        
        // Coba hubungi endpoint publik yang dikenal
        fetch('https://api.github.com/zen', { cache: 'no-store' }) // cache: no-store untuk memastikan permintaan baru
            .then(response => {
                // Ini adalah hasil jika CSP mengizinkan koneksi
                log.warn('FETCH SUCCEEDED! Status Respons: ' + response.status);
                log.warn('Domain ini mungkin diizinkan oleh kebijakan connect-src CSP.');
                return response.text();
            })
            .then(data => {
                log.info('Data Respons Fetch: ' + data);
            })
            .catch(err => {
                // Ini adalah hasil yang diharapkan jika CSP memblokir koneksi
                log.success(`FETCH GAGAL (sesuai ekspektasi jika ada CSP). Error: ${err.name} - ${err.message}`);
                log.warn('Periksa konsol browser utama (F12) untuk melihat error pelanggaran CSP yang spesifik.');
            });
            
    } catch (err) {
        log.error(`Fetch Execution Error: ${err.name} - ${err.message}`);
    }
}

// Jalankan fungsi
runAudioRecon();