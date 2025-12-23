// ==================== API CONFIGURATION ====================

class ApiConfig {
  constructor() {
    // Detectar ambiente automáticamente
    this.environment = this.detectEnvironment();
    this.config = this.getConfig();
  }

  detectEnvironment() {
    // FORZAR MODO DESARROLLO PARA TRABAJO LOCAL (comentar para producción)
    //return "development";

    // Detección automática de ambiente (activado para producción)
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "development";
    }

    return "production";
  }

  getConfig() {
    const configs = {
      development: {
        apiUrl: "", // Vacío para usar rutas relativas (localhost)
        apiTimeout: 30000,
        enableLogging: true,
      },
      production: {
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

  log(...args) {
    if (this.enableLogging) {
      //////console.log('[API]', ...args);
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
