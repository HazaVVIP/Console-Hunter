/**
 * =============================================================================
 *  Deep Property Inspector v1 (Untuk Workbench)
 * =============================================================================
 * Tujuan:
 * 1. Mengambil semua kunci dari objek 'window' yang diketahui.
 * 2. Mengekstrak TIPE DATA dan NILAI dari setiap properti.
 * 3. Mengkategorikan hasil (Objek, Fungsi, Primitif, Error) untuk analisis.
 * =============================================================================
 */

(function() {
    if (typeof log === 'undefined') {
        alert('ERROR: Skrip ini dirancang untuk berjalan di dalam Interactive Workbench.');
        return;
    }

    // Daftar kunci yang akan diinspeksi, berdasarkan data Anda
    const keysToInspect = [
        'window', 'self', 'document', 'name', 'location', 'customElements', 'history', 'navigation', 'locationbar', 'menubar', 'personalbar', 'scrollbars', 'statusbar', 'toolbar', 'status', 'closed', 'frames', 'length', 'top', 'opener', 'parent', 'frameElement', 'navigator', 'origin', 'external', 'screen', 'innerWidth', 'innerHeight', 'scrollX', 'pageXOffset', 'scrollY', 'pageYOffset', 'visualViewport', 'screenX', 'screenY', 'outerWidth', 'outerHeight', 'devicePixelRatio', 'event', 'clientInformation', 'screenLeft', 'screenTop', 'styleMedia', 'onsearch', 'trustedTypes', 'performance', 'onappinstalled', 'onbeforeinstallprompt', 'crypto', 'indexedDB', 'sessionStorage', 'localStorage', 'onbeforexrselect', 'onabort', 'onbeforeinput', 'onbeforematch', 'onbeforetoggle', 'onblur', 'oncancel', 'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'onclose', 'oncontentvisibilityautostatechange', 'oncontextlost', 'oncontextmenu', 'oncontextrestored', 'oncuechange', 'ondblclick', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'onclose', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onfocus', 'onformdata', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreset', 'onresize', 'onscroll', 'onsecuritypolicyviolation', 'onseeked', 'onseeking', 'onselect', 'onslotchange', 'onstalled', 'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'onvolumechange', 'onwaiting', 'onwebkitanimationend', 'onwebkitanimationiteration', 'onwebkitanimationstart', 'onwebkittransitionend', 'onwheel', 'onauxclick', 'ongotpointercapture', 'onlostpointercapture', 'onpointerdown', 'onpointermove', 'onpointerrawupdate', 'onpointerup', 'onpointercancel', 'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave', 'onselectstart', 'onselectionchange', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitionrun', 'ontransitionstart', 'ontransitionend', 'ontransitioncancel', 'onafterprint', 'onbeforeprint', 'onbeforeunload', 'onhashchange', 'onlanguagechange', 'onmessage', 'onmessageerror', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onrejectionhandled', 'onstorage', 'onunhandledrejection', 'onunload', 'isSecureContext', 'crossOriginIsolated', 'scheduler', 'alert', 'atob', 'blur', 'btoa', 'cancelAnimationFrame', 'cancelIdleCallback', 'captureEvents', 'clearInterval', 'clearTimeout', 'close', 'confirm', 'createImageBitmap', 'fetch', 'find', 'focus', 'getComputedStyle', 'getSelection', 'matchMedia', 'moveBy', 'moveTo', 'open', 'postMessage', 'print', 'prompt', 'queueMicrotask', 'releaseEvents', 'reportError', 'requestAnimationFrame', 'requestIdleCallback', 'resizeBy', 'resizeTo', 'scroll', 'scrollBy', 'scrollTo', 'setInterval', 'setTimeout', 'stop', 'structuredClone', 'webkitCancelAnimationFrame', 'webkitRequestAnimationFrame', 'chrome', 'caches', 'cookieStore', 'ondevicemotion', 'ondeviceorientation', 'ondeviceorientationabsolute', 'sharedStorage', 'ontouchcancel', 'ontouchend', 'ontouchmove', 'ontouchstart', 'fetchLater', 'getDigitalGoodsService', 'getScreenDetails', 'showDirectoryPicker', 'showOpenFilePicker', 'showSaveFilePicker', 'originAgentCluster', 'viewport', 'onorientationchange', 'orientation', 'onpageswap', 'onpagereveal', 'credentialless', 'fence', 'launchQueue', 'speechSynthesis', 'oncommand', 'onscrollend', 'onscrollsnapchange', 'onscrollsnapchanging', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', '__firebase_config', '__initial_auth_token', '__app_id', 'h', 'l', 'n', 'p', 'r', 't', 'u', 'v', 'w', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'N', 'O', 'aa', 'ba', 'ca', 'da', 'ea', 'fa', 'ha', 'P', 'ka', 'la', 'ma', 'R', 'S', 'na', 'oa', 'pa', 'T', 'V', 'W', 'X', 'qa', 'ra', 'sa', 'ta', 'ua', 'va', 'wa', 'xa', 'Y', 'Z', 'za', 'Aa', 'Ba', 'firebaseAuthBridgeScriptLoaded', 'requestNewFirebaseToken', 'log', 'probe', 'clearLog'
    ];

    const results = {
        objects: [],
        functions: [],
        primitives: [],
        errors: []
    };

    log.info(`---[ Memulai Deep Inspector pada ${keysToInspect.length} properti ]---`);

    for (const key of keysToInspect) {
        try {
            const value = window[key];
            const type = typeof value;

            let displayValue;
            switch (type) {
                case 'object':
                    if (value === null) {
                        displayValue = 'null';
                    } else {
                        try {
                            // Coba stringify, batasi kedalaman untuk objek besar
                            displayValue = JSON.stringify(value, (k, v) => (k && typeof v === 'object' && v !== null) ? '[Object]' : v, 2);
                        } catch (e) {
                            displayValue = `[Unserializable Object: ${e.message}]`;
                        }
                    }
                    results.objects.push({ key, type, value: displayValue });
                    break;
                case 'function':
                    results.functions.push({ key, type, value: value.toString().substring(0, 150) + '...' });
                    break;
                case 'string':
                case 'number':
                case 'boolean':
                case 'undefined':
                    results.primitives.push({ key, type, value });
                    break;
                default:
                    results.primitives.push({ key, type, value: String(value) });
            }
        } catch (err) {
            results.errors.push({ key, message: err.message });
        }
    }

    // --- Tampilkan Laporan Hasil ---
    log.success("\n=================================================");
    log.success("          🕵️  DEEP INSPECTION REPORT 🕵️");
    log.success("=================================================");

    log.warn("\n--- 🎯 TARGET UTAMA (OBJEK & KONFIGURASI) 🎯 ---");
    results.objects.forEach(r => log.info(`[${r.key}] (${r.type}):\n${r.value}`));

    log.warn("\n--- ⚙️ FUNGSI YANG TERSEDIA ⚙️ ---");
    results.functions.forEach(r => log.info(`[${r.key}] (${r.type}): ${r.value}`));

    log.warn("\n--- 📝 DATA PRIMITIF 📝 ---");
    results.primitives.forEach(r => log.info(`[${r.key}] (${r.type}): ${r.value}`));

    if (results.errors.length > 0) {
        log.error("\n--- ❌ ERROR AKSES ❌ ---");
        results.errors.forEach(r => log.error(`[${r.key}]: ${r.message}`));
    }
    
    log.info("\n---[ Inspeksi Mendalam Selesai ]---");
})();