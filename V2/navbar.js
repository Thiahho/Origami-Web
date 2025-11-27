// Navbar authentication state manager
document.addEventListener("DOMContentLoaded", () => {
  const authButton = document.getElementById("authButton")

  // Verificar token en localStorage o sessionStorage
  const token = localStorage.getItem("token") || localStorage.getItem("authToken") || sessionStorage.getItem("token")

  if (token && token !== "null" && token !== "") {
    // Usuario logueado - cambiar a "Volver al Panel"
    authButton.href = "dashboard.html"
    authButton.setAttribute("aria-label", "Volver al Panel")
    authButton.querySelector(".btn-login__label").textContent = "Volver al Panel"
    authButton.querySelector("i").className = "fa-solid fa-gauge"
  }
})
