/**
 * sw register
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (register) {
      console.log('ServiceWorker registered!');
    }, function (err) {
      console.log('ServiceWorker not registered... ', err);
    });
  });
}
