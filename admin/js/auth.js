// ==================== AUTHENTICATION SYSTEM ====================

class AuthManager {
  constructor() {
    this.isNavigating = false;
    this.tabId = `tab-${Date.now()}-${Math.random()}`;
    this.setupTabTracking();
    this.setupBeforeUnloadHandler();
    // NO ejecutar setupSessionDetection() aquí - se ejecutará después de verificar auth
    this.init();
  }

  setupTabTracking() {
    // Marcar timestamp de última actividad para esta pestaña
    const tabData = {
      id: this.tabId,
      lastSeen: Date.now()
    };

    // Obtener tabs actuales y limpiar los antiguos (más de 5 segundos sin actividad)
    let openTabs = JSON.parse(localStorage.getItem("openAdminTabs") || "[]");
    const now = Date.now();

    // Filtrar tabs que están realmente activos (vistos hace menos de 5 segundos)
    openTabs = openTabs.filter(tab => {
      if (typeof tab === 'string') {
        // Formato viejo, mantener por compatibilidad
        return true;
      }
      return (now - tab.lastSeen) < 5000;
    });

    // Agregar este tab
    openTabs.push(tabData);
    localStorage.setItem("openAdminTabs", JSON.stringify(openTabs));

    console.log(`[Auth] Pestaña registrada: ${this.tabId}. Total pestañas activas: ${openTabs.length}`);

    // Usar beforeunload solo para marcar que no estamos activos
    window.addEventListener("beforeunload", () => {
      // Marcar como inactivo pero NO eliminar todavía
      this.markTabInactive();
    });
  }

  markTabInactive() {
    // Marcar este tab como inactivo (lastSeen = 0)
    let openTabs = JSON.parse(localStorage.getItem("openAdminTabs") || "[]");

    openTabs = openTabs.map(tab => {
      if (typeof tab === 'string') {
        return tab === this.tabId ? { id: tab, lastSeen: 0 } : tab;
      }
      return tab.id === this.tabId ? { ...tab, lastSeen: 0 } : tab;
    });

    localStorage.setItem("openAdminTabs", JSON.stringify(openTabs));
    console.log(`[Auth] Pestaña marcada como inactiva: ${this.tabId}`);
  }

  removeTab() {
    let openTabs = JSON.parse(localStorage.getItem("openAdminTabs") || "[]");

    // Filtrar este tab
    openTabs = openTabs.filter(tab => {
      if (typeof tab === 'string') return tab !== this.tabId;
      return tab.id !== this.tabId;
    });

    console.log(`[Auth] Pestaña eliminada: ${this.tabId}. Pestañas restantes: ${openTabs.length}`);

    if (openTabs.length === 0) {
      // Esta era la última pestaña - cerrar sesión
      console.log("[Auth] Última pestaña cerrada - cerrando sesión");
      localStorage.removeItem("openAdminTabs");
      sessionStorage.clear();
      localStorage.removeItem("hadAdminSession");

      // Hacer logout en el servidor
      const apiBaseUrl = window.apiConfig?.apiUrl || "";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${apiBaseUrl}/Admin/logout`);
      }
    } else {
      // Aún hay otras pestañas abiertas
      localStorage.setItem("openAdminTabs", JSON.stringify(openTabs));
    }
  }

  setupSessionDetection() {
    // Verificar si hay pestañas activas
    let openTabs = JSON.parse(localStorage.getItem("openAdminTabs") || "[]");
    const now = Date.now();

    // Filtrar solo tabs activos (vistos en los últimos 10 segundos)
    const activeTabs = openTabs.filter(tab => {
      if (typeof tab === 'string') {
        // Formato viejo, asumir activo
        return true;
      }
      // Si lastSeen es 0, el tab se cerró/navegó
      if (tab.lastSeen === 0) return false;
      // Si no se ha visto en más de 10 segundos, está muerto
      return (now - tab.lastSeen) < 10000;
    });

    const hadSessionBefore = localStorage.getItem("hadAdminSession");

    console.log(`[Auth] Tabs activos: ${activeTabs.length}, Había sesión: ${hadSessionBefore}`);

    // IMPORTANTE: Solo cerrar sesión si no hay tabs Y no estamos en proceso de login
    // El tab actual ya se registró en setupTabTracking(), así que si activeTabs.length === 0
    // es porque realmente no hay tabs (no porque estemos en medio del login)

    // Dar 1 segundo de gracia para que el tab actual se registre completamente
    if (activeTabs.length === 0 && hadSessionBefore) {
      // Verificar una vez más después de un pequeño delay
      setTimeout(() => {
        const recheckTabs = JSON.parse(localStorage.getItem("openAdminTabs") || "[]");
        const recheckActive = recheckTabs.filter(tab => {
          if (typeof tab === 'string') return true;
          if (tab.lastSeen === 0) return false;
          return (Date.now() - tab.lastSeen) < 10000;
        });

        if (recheckActive.length === 0) {
          console.log("[Auth] No hay pestañas activas - limpiando sesión");
          this.performTabCloseLogout();
        }
      }, 1000);
    } else if (activeTabs.length < openTabs.length) {
      // Actualizar la lista eliminando tabs inactivos
      localStorage.setItem("openAdminTabs", JSON.stringify(activeTabs));
    }
  }


  performTabCloseLogout() {
    console.log("[Auth] Ejecutando cierre de sesión por cierre de todas las pestañas");

    // Limpiar toda la información de sesión
    sessionStorage.clear();
    localStorage.removeItem("hadAdminSession");
    localStorage.removeItem("openAdminTabs");

    // Hacer logout en el servidor
    const apiBaseUrl = window.apiConfig?.apiUrl || "";

    // Usar fetch con keepalive para que funcione al cerrar
    fetch(`${apiBaseUrl}/Admin/logout`, {
      method: 'POST',
      credentials: 'include',
      keepalive: true
    }).catch(() => {
      // Ignorar errores, el tab se está cerrando
    });

    // Si estamos en página admin, redirigir a login
    if (window.location.pathname.includes("/admin/") &&
        !window.location.pathname.includes("login.html")) {
      window.location.href = "/admin/auth/login.html";
    }
  }

  setupBeforeUnloadHandler() {
    // Heartbeat para mantener el tab activo y actualizar su timestamp
    setInterval(() => {
      if (!sessionStorage.getItem("adminSession")) return;

      let openTabs = JSON.parse(localStorage.getItem("openAdminTabs") || "[]");
      const now = Date.now();
      let tabFound = false;

      // Actualizar el timestamp de este tab
      openTabs = openTabs.map(tab => {
        if (typeof tab === 'string') {
          if (tab === this.tabId) {
            tabFound = true;
            return { id: tab, lastSeen: now };
          }
          return tab;
        }
        if (tab.id === this.tabId) {
          tabFound = true;
          return { ...tab, lastSeen: now };
        }
        return tab;
      });

      // Si este tab no está registrado, agregarlo
      if (!tabFound) {
        openTabs.push({ id: this.tabId, lastSeen: now });
        console.log(`[Auth] Tab re-registrado: ${this.tabId}`);
      }

      // Limpiar tabs inactivos (más de 10 segundos sin heartbeat)
      const activeTabs = openTabs.filter(tab => {
        if (typeof tab === 'string') return true;
        return (now - tab.lastSeen) < 10000;
      });

      if (activeTabs.length !== openTabs.length) {
        console.log(`[Auth] Limpiados ${openTabs.length - activeTabs.length} tabs inactivos`);
      }

      localStorage.setItem("openAdminTabs", JSON.stringify(activeTabs));
    }, 2000); // Cada 2 segundos
  }

  init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupLoginForm();
        this.checkAuthStatus();
      });
    } else {
      this.setupLoginForm();
      this.checkAuthStatus();
    }
  }

  setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  async handleLogin(event) {
    event.preventDefault();

    // //console.log("[Auth] DOM readyState:", document.readyState);
    ////console.log("[Auth] Buscando inputs...");

    // Usar el formulario que disparó el submit para mayor robustez
    const form = event.currentTarget || document.getElementById("loginForm");

    // Obtener referencias a los inputs (por id, name o tipo)
    const emailInput =
      form?.querySelector('input[name="email"], #email, input[type="email"]') ||
      document.querySelector("#email") ||
      document.querySelector('input[name="email"]');
    const passwordInput =
      form?.querySelector(
        'input[name="password"], #password, input[type="password"]'
      ) ||
      document.querySelector("#password") ||
      document.querySelector('input[name="password"]');

    /* //console.log("[Auth] Inputs encontrados:", {
      emailInput: !!emailInput,
      passwordInput: !!passwordInput,
    }); */

    //  //console.log("[Auth] Email input element:", emailInput);
    // //console.log("[Auth] Password input element:", passwordInput);

    if (!emailInput || !passwordInput) {
      this.showError("Error: No se encontraron los campos del formulario");
      return;
    }

    // Obtener valores
    const email = emailInput.value?.trim() || "";
    const password = passwordInput.value || "";

    /*  //console.log("[Auth] Valores:", {
      emailLength: email.length,
      passwordLength: password.length,
      emailValue: email,
    }); */

    // Validación básica
    if (!email || !password) {
      this.showError("Por favor ingresa email y contraseña");
      return;
    }

    // Loading state
    const submitBtn =
      (form && form.querySelector('button[type="submit"]')) ||
      document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.disabled = true;

    try {
      // Llamar al backend
      const response = await window.apiService.login(email, password);

      // Guardar sesión localmente
      const sessionData = {
        email: response.usuario.email,
        rol: response.usuario.rol,
        loginTime: new Date().toISOString(),
      };

      sessionStorage.setItem("adminSession", JSON.stringify(sessionData));

      // Marcar que hay una sesión activa
      localStorage.setItem("hadAdminSession", "true");

      // Success feedback
      this.showMessage("¡Inicio de sesión exitoso!", "success");

      // Esperar un poco más para asegurar que la cookie se establezca
      // antes de redirigir (importante en producción con Render/Vercel)
      setTimeout(() => {
        window.location.href = "/admin/dashboard.html";
      }, 1500);
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";

      if (error instanceof window.ApiError) {
        if (error.isAuthError()) {
          errorMessage = "Credenciales incorrectas";
        } else if (error.isServerError()) {
          errorMessage = "Error del servidor. Intenta nuevamente.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = "No se pudo conectar con el servidor";
      }

      this.showError(errorMessage);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async checkAuthStatus() {
    // If we're on login page, check if already authenticated
    if (window.location.pathname.includes("login.html")) {
      try {
        const response = await window.apiService.verifySession();
        if (response.isAuthenticated) {
          // Already authenticated, redirect to dashboard
          window.location.href = "/admin/dashboard.html";
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
      // Ejecutar session detection DESPUÉS de verificar
      this.setupSessionDetection();
      return;
    }

    // If we're on admin pages, verify authentication
    if (
      window.location.pathname.includes("/admin/") &&
      !window.location.pathname.includes("login.html")
    ) {
      // Verificar si hay sesión local antes de llamar al servidor
      const localSession = sessionStorage.getItem("adminSession");

      try {
        //  //console.log("[Auth] Verificando sesión...");
        const response = await window.apiService.verifySession();
        // //console.log("[Auth] Respuesta de verify:", response);

        if (!response.isAuthenticated) {
          console.error("[Auth] No autenticado según response");
          throw new Error("Not authenticated");
        }

        // Update local session
        const sessionData = {
          email: response.usuario.email,
          rol: response.usuario.rol,
          loginTime: new Date().toISOString(),
        };
        sessionStorage.setItem("adminSession", JSON.stringify(sessionData));

        // Marcar que hay una sesión activa
        localStorage.setItem("hadAdminSession", "true");

        // //console.log("[Auth] Sesión válida:", sessionData);

        // Ejecutar session detection DESPUÉS de verificar y guardar sesión
        this.setupSessionDetection();

        return sessionData;
      } catch (error) {
        // Si hay error de red PERO tenemos sesión local reciente, NO cerrar sesión
        if (localSession && error.status === 0) {
          console.warn("[Auth] Error de red, pero hay sesión local válida. Manteniendo sesión.");

          // Ejecutar session detection de todas formas
          this.setupSessionDetection();

          // Reintentar verificación después de 5 segundos
          setTimeout(() => this.retryVerifySession(), 5000);
          return;
        }

        // Solo hacer logout si es error de autenticación (401/403) no error de red
        if (error.status === 401 || error.status === 403) {
          console.error("[Auth] Error de autenticación:", error);
          this.logout();
        } else {
          // Error de red/servidor - mantener sesión local
          console.warn("[Auth] Error de servidor/red. Manteniendo sesión local.");
          this.setupSessionDetection();
        }
      }
    } else {
      // No estamos en página de admin, ejecutar session detection de todas formas
      this.setupSessionDetection();
    }
  }

  async retryVerifySession() {
    try {
      const response = await window.apiService.verifySession();
      if (response.isAuthenticated) {
        console.log("[Auth] Reconexión exitosa");
        const sessionData = {
          email: response.usuario.email,
          rol: response.usuario.rol,
          loginTime: new Date().toISOString(),
        };
        sessionStorage.setItem("adminSession", JSON.stringify(sessionData));
      }
    } catch (error) {
      console.warn("[Auth] Reintento de verificación falló, se reintentará en próxima interacción");
    }
  }

  getSession() {
    try {
      const sessionData = sessionStorage.getItem("adminSession");
      if (!sessionData) return null;

      return JSON.parse(sessionData);
    } catch (error) {
      console.error("Error reading session:", error);
      this.logout();
      return null;
    }
  }

  async logout() {
    try {
      // Remover este tab del registro antes de hacer logout
      this.removeTab();

      await window.apiService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Limpiar toda la información de sesión
      sessionStorage.clear();
      localStorage.removeItem("hadAdminSession");
      localStorage.removeItem("openAdminTabs");

      if (
        window.location.pathname.includes("/admin/") &&
        !window.location.pathname.includes("login.html")
      ) {
        window.location.href = "/admin/auth/login.html";
      }
    }
  }

  showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";

      // Auto hide after 5 seconds
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 5000);
    }
  }

  showMessage(message, type = "info") {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${
        type === "success" ? "check-circle" : "info-circle"
      }"></i>
      ${message}
    `;

    // Add toast styles if not exist
    if (!document.querySelector("#toast-styles")) {
      const styles = document.createElement("style");
      styles.id = "toast-styles";
      styles.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 1rem 1.5rem;
          color: white;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideIn 0.3s ease;
        }
        .toast-success { border-left: 4px solid #4caf50; }
        .toast-error { border-left: 4px solid #0b64a1; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Method to get current user info
  getCurrentUser() {
    const session = this.getSession();
    return session
      ? {
          email: session.email,
          rol: session.rol,
          loginTime: session.loginTime,
        }
      : null;
  }
}

// Initialize auth manager when DOM is ready
let authManager;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    authManager = new AuthManager();
  });
} else {
  authManager = new AuthManager();
}

// Global auth functions
window.logout = () => authManager?.logout();
window.getCurrentUser = () => authManager?.getCurrentUser();
