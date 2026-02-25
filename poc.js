(async function() {
  const logger = window.log || { 
    info: console.log, 
    success: console.log, 
    error: console.error, 
    warn: console.warn 
  };

  logger.info("=== Memulai Window Hierarchy Scan (XSS Focus) ===");

  const targets = [
    { name: "window.self", obj: window },
    { name: "window.parent", obj: window.parent },
    { name: "window.top", obj: window.top },
    { name: "window.opener", obj: window.opener }
  ];

  // Tambahkan frame jika ada
  for (let i = 0; i < window.frames.length; i++) {
    targets.push({ name: `window.frames[${i}]`, obj: window.frames[i] });
  }

  for (const target of targets) {
    if (!target.obj) {
      logger.warn(`${target.name}: Not Found / Null`);
      continue;
    }

    try {
      // Mencoba akses properti lintas-asal
      const origin = target.obj.origin || "N/A";
      const loc = target.obj.location.href;
      
      logger.success(`[ACCESSIBLE] ${target.name}`);
      logger.info(`  > Origin: ${origin}`);
      logger.info(`  > URL: ${loc}`);

      // Deteksi jika kita berada di domain yang berbeda namun tetap bisa akses (SOP Bypass)
      if (origin !== window.origin && origin !== "null") {
        logger.warn(`  [!] ALERT: Cross-Origin Access detected on ${target.name}! Potential SOP Bypass.`);
      }
    } catch (e) {
      // Jika error, berarti SOP (Same-Origin Policy) memblokir akses
      logger.error(`[BLOCKED] ${target.name}: Protected by SOP`);
    }
  }

  // Pengujian Spesifik: PostMessage Discovery
  logger.info("Mengecek ketersediaan postMessage pada parent/opener...");
  
  if (window.parent !== window.self) {
    logger.info("Target: window.parent tersedia untuk postMessage probing.");
  }
  
  if (window.opener) {
    logger.success("Target: window.opener terdeteksi. Potensi Tabnabbing atau Cross-Window communication.");
  }

  logger.info("=== Scan Selesai ===");
})();
