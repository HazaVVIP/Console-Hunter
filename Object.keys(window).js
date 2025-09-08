/**
 * =============================================================================
 *  Window Inspector v1 (Untuk Workbench)
 * =============================================================================
 * Tujuan:
 * 1. Mengambil semua nama properti (kunci) dari objek `window` global.
 * 2. Menggabungkan semua kunci tersebut menjadi satu string tunggal.
 * 3. Menampilkan string hasil di output untuk analisis cepat.
 * =============================================================================
 */

(function() {
    // Pastikan skrip berjalan di lingkungan yang benar
    if (typeof log === 'undefined') {
        alert('ERROR: Skrip ini dirancang untuk berjalan di dalam Interactive Workbench.');
        return;
    }

    log.info("---[ Memulai Window Property Inspector ]---");
    log.info("Mengekstrak semua kunci dari objek 'window'...");

    try {
        // 1. Ambil semua kunci dari objek `window`
        const allWindowKeys = Object.keys(window);

        // 2. Gabungkan array kunci menjadi satu string, dipisahkan oleh koma dan spasi
        const keysAsString = allWindowKeys.join(', ');

        // 3. Tampilkan hasilnya di output
        log.success(`Ditemukan ${allWindowKeys.length} properti di objek 'window'.`);
        log.info("Daftar Properti:");
        
        // Menggunakan log._append untuk tampilan yang lebih bersih tanpa prefix default '>'
        log._append(keysAsString, 'var(--color-info)', 'KEYS>');

    } catch (err) {
        log.error("Terjadi kesalahan saat mencoba memeriksa objek 'window':");
        log.error(err.message);
    }

    log.info("\n---[ Inspeksi Selesai ]---");

})();