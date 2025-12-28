// Navbar authentication state manager
function updateNavbarButton() {
  const authButton = document.getElementById("authButton");

  if (!authButton) {
    return;
  }

  // Verificar múltiples posibles nombres de keys
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken");

  ////console.log('Token encontrado:', token); // Para debug
  ////console.log('LocalStorage keys:', Object.keys(localStorage)); // Para debug

  if (token && token !== "null" && token !== "") {
    // Usuario logueado - cambiar a "Volver al Panel"
    authButton.href = "../admin/dashboard.html";
    authButton.setAttribute("aria-label", "Volver al Panel");
    const label = authButton.querySelector(".btn-login__label");
    if (label) {
      label.textContent = "Volver al Panel";
    }
    const icon = authButton.querySelector("i");
    if (icon) {
      icon.className = "fa-solid fa-gauge";
    }
    ////console.log('Botón actualizado a "Ir al Panel"');
  } else {
    ////console.log('No hay token válido encontrado');
  }
}

document.addEventListener("DOMContentLoaded", updateNavbarButton);
if (document.readyState !== "loading") {
  updateNavbarButton();
}

window.updateNavbarButton = updateNavbarButton;
