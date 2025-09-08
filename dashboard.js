/**
 * =============================================================================
 * Session Dashboard v1.1 (Struktur Ditingkatkan)
 * =============================================================================
 * PERBAIKAN:
 * - Mengubah dari IIFE menjadi fungsi bernama 'runDashboard()' untuk
 * membuatnya lebih mudah disalin dan mencegah SyntaxError.
 * - Fungsionalitas tetap sama.
 * =============================================================================
 */

// [PERBAIKAN STRUKTUR] Mendefinisikan fungsi async bernama
async function runDashboard() {
    const { collection, getDocs, addDoc, deleteDoc, query } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        throw new Error("Objek 'auth' atau 'db' tidak ditemukan. Pastikan workbench sudah terotentikasi.");
    }

    const currentUser = auth.currentUser;
    const appId = window.__app_id || 'unknown-app-id';

    // --- TAHAP 1: Tampilkan Informasi Sesi & Pengguna ---
    log.success("---[ 👤 INFORMASI SESI PENGGUNA ]---");
    if (currentUser) {
        log.info({
            "User ID (UID)": currentUser.uid,
            "Anonymous": currentUser.isAnonymous,
            "Provider ID": currentUser.providerId,
            "App ID": appId
        });
    } else {
        log.error("Tidak ada pengguna yang sedang login.");
        return; // Hentikan eksekusi jika tidak ada pengguna
    }

    // --- TAHAP 2: Uji Izin Firestore ---
    log.warn("\n---[ 🛡️ PENGUJIAN IZIN FIRESTORE ]---");
    const report = {};
    const chatCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/chats`;
    const chatRef = collection(db, chatCollectionPath);

    // Tes BACA
    try {
        await getDocs(query(chatRef));
        report['BACA (Read History)'] = '✅ Diizinkan';
    } catch (e) {
        report['BACA (Read History)'] = `❌ Ditolak (${e.code})`;
    }

    // Tes TULIS
    let tempDocRef;
    try {
        tempDocRef = await addDoc(chatRef, { role: 'user', text: 'permission_test' });
        report['TULIS (Write Message)'] = '✅ Diizinkan';
    } catch (e) {
        report['TULIS (Write Message)'] = `❌ Ditolak (${e.code})`;
    }
    
    // Tes HAPUS
    if (tempDocRef) {
        try {
            await deleteDoc(tempDocRef);
            report['HAPUS (Delete Message)'] = '✅ Diizinkan';
        } catch (e) {
            report['HAPUS (Delete Message)'] = `❌ Ditolak (${e.code})`;
        }
    } else {
        report['HAPUS (Delete Message)'] = '❔ Tidak Diuji (Tulis gagal)';
    }

    log.info(report);
    log.info("\n---[ Dasbor Selesai Dimuat ]---");
}

// [PERBAIKAN STRUKTUR] Panggil fungsi dan tangkap error jika ada
runDashboard().catch(err => log.error(err.message));