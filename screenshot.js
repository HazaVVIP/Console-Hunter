/**
 * =============================================================================
 *  Data Visualization v2 (Diadaptasi untuk Workbench)
 * =============================================================================
 * Tujuan:
 * 1. Mencegat data gambar dari fungsi aplikasi target.
 * 2. Merender data gambar tersebut langsung di dalam konsol output workbench
 *    untuk analisis visual.
 * =============================================================================
 */

log.info("Mempersiapkan penyadapan fungsi untuk visualisasi data...");

// Pastikan kita memiliki referensi ke fungsi asli sebelum menimpanya
const original_Y = window.Y;

// Dapatkan elemen output dari workbench untuk merender gambar di dalamnya
const outputArea = document.getElementById('outputArea');

if (typeof original_Y !== 'function' || typeof window.Aa !== 'function') {
    log.error("GAGAL: Fungsi target 'Y' atau 'Aa' tidak ditemukan di window.");
} else if (!outputArea) {
    log.error("GAGAL: Elemen 'outputArea' workbench tidak dapat ditemukan.");
} else {
    log.info("Menimpa fungsi Y() untuk mencegat output...");

    // Timpa fungsi Y dengan versi kita
    window.Y = function(element, options) {
        // Panggil fungsi asli untuk mendapatkan Promise yang berisi data gambar
        const promiseOfImage = original_Y(element, options);

        // Tangani hasilnya ketika Promise selesai
        return promiseOfImage.then(imageDataUrl => {
            log.success("\n---== Intercepted Image Data ==---");
            
            const imagePreview = imageDataUrl.substring(0, 100) + "...";
            log.info(`Image Data URL (Preview): ${imagePreview}`);

            log.info("\nMembuat pratinjau gambar dari data yang diterima...");
            
            // Buat elemen gambar baru
            const interceptedImage = document.createElement('img');
            interceptedImage.src = imageDataUrl; // Sumber gambar adalah data URL yang kita dapatkan
            
            // Tambahkan gaya agar mudah dilihat
            interceptedImage.style.display = 'block';
            interceptedImage.style.maxWidth = '90%';
            interceptedImage.style.margin = '15px auto';
            interceptedImage.style.border = '3px solid var(--color-info)';
            interceptedImage.style.borderRadius = '4px';
            
            // **[PERBAIKAN]** Tambahkan gambar ke dalam outputArea, bukan ke body
            outputArea.appendChild(interceptedImage);
            
            // Gulir ke bawah agar gambar langsung terlihat
            outputArea.scrollTop = outputArea.scrollHeight;
            
            log.success("--- Gambar berhasil dirender di atas ---");

            // Kembalikan data asli agar tidak mengganggu alur aplikasi utama
            return imageDataUrl;
        }).catch(err => {
            log.error("Error saat memproses data gambar dari fungsi Y().");
            log.error(err);
            // Tetap lemparkan error agar bisa ditangani lebih lanjut jika ada
            throw err;
        });
    };

    log.warn("Penyadapan fungsi Y() aktif. Memicu fungsi Aa() untuk memulai proses...");
    
    // Panggil Aa(), yang sekarang akan dieksekusi dengan fungsi Y() kita
    window.Aa({ origin: '*' });
}