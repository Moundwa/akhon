document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var form = document.querySelector('form[data-akhon-form]');
  if (form) {
    var next = form.querySelector('input[name="_next"]');
    if (next) {
      var origin = window.location.origin;
      var path = window.location.pathname;
      var root = path.indexOf('/akhon') === 0 ? '/akhon' : '';
      next.value = origin + root + '/pages/merci.html';
    }
  }
});
