// ==================== AUTH GUARD ====================
// Este script DEBE cargarse de forma SINCRÓNICA antes que cualquier otro contenido
// Se ejecuta inmediatamente para bloquear acceso no autorizado

(function () {
  "use strict";

  // Ocultar el body inmediatamente hasta verificar autenticación
  document.documentElement.style.visibility = "hidden";

  // Función para verificar autenticación de forma síncrona
  async function verifyAuthSync() {
    const currentPath = window.location.pathname;

    // Si estamos en login, permitir acceso
    if (currentPath.includes("login.html")) {
      document.documentElement.style.visibility = "visible";
      return;
    }

    // Si NO estamos en una página de admin, permitir acceso
    if (!currentPath.includes("/admin/")) {
      document.documentElement.style.visibility = "visible";
      return;
    }

    // Verificar si hay una sesión local válida (recién logueado)
    const localSession = sessionStorage.getItem("adminSession");

    try {
      // Verificar sesión con el servidor usando fetch
      const apiBaseUrl = "https://origamiimportados.com";
      const response = await fetch(`${apiBaseUrl}/api/Admin/verify`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

      const data = await response.json();

      if (!data.isAuthenticated) {
        throw new Error("Not authenticated");
      }

      // Usuario autenticado - mostrar contenido
      document.documentElement.style.visibility = "visible";
    } catch (error) {
      // Si hay sesión local, dar una segunda oportunidad (pueden estar sincronizándose las cookies)
      if (localSession) {
        console.warn(
          "[Auth Guard] Error en verificación pero hay sesión local. Reintentando..."
        );

        // Esperar 500ms y reintentar UNA vez
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const apiBaseUrl = "https://origamiimportados.com";
          const retryResponse = await fetch(`${apiBaseUrl}/api/Admin/verify`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            if (retryData.isAuthenticated) {
              console.log("[Auth Guard] Reintento exitoso");
              document.documentElement.style.visibility = "visible";
              return;
            }
          }
        } catch (retryError) {
          console.error("[Auth Guard] Reintento falló:", retryError);
        }
      }

      // No autenticado - redirigir inmediatamente sin mostrar contenido
      console.warn("[Auth Guard] No autenticado, redirigiendo...");
      sessionStorage.clear(); // Limpiar sesión local corrupta
      window.location.replace("/admin/auth/login.html");
    }
  }

  // Ejecutar verificación inmediatamente
  verifyAuthSync();
})();
