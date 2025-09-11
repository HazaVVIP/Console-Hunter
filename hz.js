// Contoh: Mencari semua input field yang tersembunyi (hidden)
var hiddenInputs = document.querySelectorAll('input[type="hidden"]');
var results = 'Input Tersembunyi Ditemukan:\n';
hiddenInputs.forEach(function(input) {
  results += input.name + ': ' + input.value + '\n';
});
alert(results);

