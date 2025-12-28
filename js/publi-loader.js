// Publi page - Navbar and Footer loader
const navbarPlaceholder = document.getElementById("navbar-placeholder");
const footerPlaceholder = document.getElementById("footer-placeholder");

if (navbarPlaceholder) {
  // Carga Navbar y Footer
  fetch("Navbar/navbar.html")
    .then((r) => r.text())
    .then((h) => {
      navbarPlaceholder.innerHTML = h;
      // Ejecutar la función de autenticación después de cargar el navbar
      setTimeout(async () => {
        if (typeof initNavbarAuth === "function") {
          await initNavbarAuth();
        } else {
          console.error("initNavbarAuth no está disponible");
        }
      }, 100);
    });
}

if (footerPlaceholder) {
  fetch("Footer/footer.html")
    .then((r) => r.text())
    .then((h) => {
      footerPlaceholder.innerHTML = h;
    });
}

// Botón flotante para volver al panel si el admin está autenticado
(async function addReturnToAdminIfAuthenticated() {
  try {
    const apiBase =
      (window.apiConfig && window.apiConfig.apiUrl) ||
      (window.frontendConfig ? window.frontendConfig.getApiUrl("") : "");
    const res = await fetch(`${apiBase}/api/Admin/verify`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data?.isAuthenticated) {
      const btn = document.createElement("a");
      btn.href = "/admin/dashboard.html";
      btn.setAttribute("aria-label", "Volver al panel de administración");
      btn.style.position = "fixed";
      btn.style.bottom = "20px";
      btn.style.right = "20px";
      btn.style.zIndex = "10000";
      btn.style.padding = "0.8rem 1rem";
      btn.style.borderRadius = "999px";
      btn.style.background = "rgba(255,255,255,0.15)";
      btn.style.backdropFilter = "blur(10px)";
      btn.style.border = "1px solid rgba(255,255,255,0.25)";
      btn.style.color = "#fff";
      btn.style.textDecoration = "none";
      btn.style.display = "flex";
      btn.style.alignItems = "center";
      btn.style.gap = ".5rem";
      btn.innerHTML = '<i class="fa-solid fa-gauge"></i> Volver al Panel';
      document.body.appendChild(btn);
    }
  } catch (e) {
    // Usuario no autenticado, no mostrar botón
  }
})(); 
