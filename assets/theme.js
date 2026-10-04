/* Tema do site: branco por padrão, escuro por escolha. A escolha fica guardada e vale para as duas páginas.
   ?tema=escuro ou ?tema=claro no endereço abre direto em um deles. Carregado no <head>, antes do primeiro desenho. */
(function () {
  "use strict";
  var KEY = "dw-theme", root = document.documentElement;
  function read() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(value) { try { window.localStorage.setItem(KEY, value); } catch (e) { /* sem armazenamento: vale só nesta visita */ } }

  var asked = /[?&]tema=(claro|escuro)(?:&|$)/.exec(window.location.search);
  var theme = asked ? (asked[1] === "escuro" ? "dark" : "light") : (read() === "dark" ? "dark" : "light");
  if (asked) save(theme);

  function apply(next) {
    theme = next;
    root.setAttribute("data-theme", theme);
    var button = document.getElementById("theme");
    if (!button) return;
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.title = theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro";
  }

  apply(theme);
  document.addEventListener("DOMContentLoaded", function () {
    apply(theme);
    var button = document.getElementById("theme");
    if (button) button.addEventListener("click", function () { apply(theme === "dark" ? "light" : "dark"); save(theme); });
  });
})();
