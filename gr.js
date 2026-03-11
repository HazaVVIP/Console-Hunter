function testSMSIntent() {
    log.info("🚀 Menguji Intent: SMS Composer...");
    const url = "intent:smsto:085267026976#Intent;action=android.intent.action.SENDTO;S.sms_body=Halo_ini_uji_coba_keamanan;end";
    
    const ifr = document.createElement('iframe');
    ifr.style.display = 'none';
    ifr.src = url;
    document.body.appendChild(ifr);
    
    log.warn("Cek apakah aplikasi Pesan/SMS terbuka.");
}
testSMSIntent();
