// ==================== API CONFIGURATION ====================

class ApiConfig {
  constructor() {
    // Detectar ambiente automáticamente
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
        apiUrl: "", // Backend API URL
        apiTimeout: 30000, // 30 segundos
        enableLogging: true,
      },
      production: {
        // ⚠️ IMPORTANTE: Actualizar con tu URL de Render después del deployment
        // Formato: https://origami-backend-api.onrender.com
        apiUrl: "https://origami-web.onrender.com",
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

  log(...args) {
    if (this.enableLogging) {
      ////console.log('[API]', ...args);
    }
  }

  error(...args) {
    if (this.enableLogging) {
      console.error("[API ERROR]", ...args);
    }
  }
}

// Exportar instancia global
window.apiConfig = new ApiConfig();
