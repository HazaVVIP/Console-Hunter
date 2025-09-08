/**
 * =============================================================================
 *  Payload v15: WebRTC Internal IP Discovery
 *  (Kompatibel dengan Interactive Workbench)
 * =============================================================================
 * Tujuan:
 * 1. Menggunakan WebRTC API untuk menemukan alamat IP lokal dari host.
 * 2. Mengumpulkan informasi jaringan untuk analisis.
 * =============================================================================
 */
async function findInternalIpViaWebRTC() {
    log.info("---[ Memulai Pencarian IP Lokal via WebRTC ]---");
    
    try {
        // Inisialisasi koneksi peer tanpa server ICE eksternal
        const pc = new RTCPeerConnection({ iceServers: [] });
        
        // Buat data channel dummy untuk memicu proses pengumpulan kandidat ICE
        pc.createDataChannel('');
        
        // Buat offer SDP untuk memulai pencarian
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Dengarkan event 'icecandidate' yang berisi informasi jaringan
        pc.onicecandidate = (ice) => {
            // Hentikan jika proses selesai atau tidak ada kandidat
            if (!ice || !ice.candidate || !ice.candidate.candidate) {
                if (ice && ice.candidate === null) {
                    log.info("---[ Pencarian IP via WebRTC Selesai ]---");
                }
                return;
            }
            
            // Regex untuk menemukan alamat IP v4 di dalam string kandidat
            // Contoh kandidat: "candidate:1 1 UDP 2130706431 192.168.1.10 57345 typ host"
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            const ipMatch = ipRegex.exec(ice.candidate.candidate);
            
            if (ipMatch) {
                // Filter alamat multicast atau alamat yang tidak relevan jika perlu
                const foundIp = ipMatch[1];
                if (foundIp.startsWith("192.168.") || foundIp.startsWith("10.") || foundIp.startsWith("172.")) {
                     log.success(`✅ --- Alamat IP Lokal Ditemukan: ${foundIp} --- ✅`);
                } else {
                     log.info(`Alamat IP lain terdeteksi: ${foundIp}`);
                }
            }
        };
    } catch (err) {
        log.error("Eksekusi WebRTC gagal. API mungkin dinonaktifkan atau tidak didukung.");
        log.error(err.message);
    }
}

// Jalankan fungsi
findInternalIpViaWebRTC();