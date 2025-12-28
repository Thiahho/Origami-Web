// Footer loader - Carga el componente footer dinámicamente
const footerPlaceholder = document.getElementById("footer-placeholder");

if (footerPlaceholder) {
  fetch("Footer/footer.html")
    .then((r) => r.text())
    .then((html) => {
      footerPlaceholder.innerHTML = html;
    });
}
