// Nama: DOM-Extractor-v2.js
// Fungsi: Mengambil snapshot DOM dan menampilkannya dalam blok kode yang diformat.

(function() {
    // --- FITUR BARU: Fungsi untuk menampilkan blok kode ---
    // Definisikan fungsi ini di dalam skrip agar mandiri.
    if (!log.codeblock) {
        log.codeblock = function(codeString, language = 'html') {
            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.wordBreak = 'break-all';
            pre.style.backgroundColor = '#1e1e1e';
            pre.style.border = '1px solid #555';
            pre.style.padding = '10px';
            pre.style.borderRadius = '5px';
            pre.style.color = '#d4d4d4';
            pre.style.maxHeight = '400px'; // Batasi tinggi dan buat dapat digulir
            pre.style.overflowY = 'auto';

            const code = document.createElement('code');
            code.className = `language-${language}`;
            code.textContent = codeString; // Aman untuk menampilkan HTML sebagai teks

            pre.appendChild(code);
            outputArea.appendChild(pre);
            outputArea.scrollTop = outputArea.scrollHeight;
        };
    }
    // --- AKHIR FITUR BARU ---

    try {
        log.success('Memulai ekstraksi DOM...');
        
        const currentDOM = document.documentElement.outerHTML;
        
        if (currentDOM) {
            log.success('Ekstraksi DOM berhasil. Snapshot halaman saat ini ada di bawah:');
            
            // PERBAIKAN: Gunakan log.codeblock() untuk menampilkan output besar
            log.codeblock(currentDOM);

            // Tidak ada yang perlu di-return karena sudah ditampilkan
            return; 
        } else {
            log.error('Gagal mengambil DOM. document.documentElement.outerHTML kosong atau tidak tersedia.');
        }
    } catch (err) {
        log.error(`Terjadi kesalahan saat mengekstrak DOM: ${err.message}`);
    }
})();