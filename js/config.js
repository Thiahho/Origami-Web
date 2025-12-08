// ==================== CONFIGURACIÓN GLOBAL - FRONTEND PÚBLICO ====================

class FrontendConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getConfig();
  }

  detectEnvironment() {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "development";
    }

    return "production";
  }

  getConfig() {
    const configs = {
      development: {
        // En desarrollo, el backend sirve el frontend
        // Las rutas relativas /api/ funcionan directamente
        apiUrl: "", // Vacío para usar rutas relativas
        apiTimeout: 30000,
        enableLogging: true,
      },
      production: {
        // En producción (Vercel), necesitamos la URL completa del backend
        // ⚠️ IMPORTANTE: Actualizar con tu URL de Render después del deployment
        apiUrl: "https://origamiimportados.com",
        apiTimeout: 30000,
        enableLogging: false,
      },
    };

    return configs[this.environment];
  }

  get apiUrl() {
    return this.config.apiUrl;
  }

  get apiTimeout() {
    return this.config.apiTimeout;
  }

  get enableLogging() {
    return this.config.enableLogging;
  }

  // Helper para construir URL completa de API
  getApiUrl(endpoint) {
    // Si apiUrl está vacío, usar ruta relativa (desarrollo)
    if (!this.config.apiUrl) {
      return endpoint;
    }
    // En producción, concatenar URL base
    return this.config.apiUrl + endpoint;
  }

  log(...args) {
    if (this.enableLogging) {
      console.log("[Frontend]", ...args);
    }
  }

  error(...args) {
    if (this.enableLogging) {
      console.error("[Frontend ERROR]", ...args);
    }
  }
}

// Exportar instancia global
window.frontendConfig = new FrontendConfig();
