// ==================== CONFIGURACIÓN GLOBAL - FRONTEND PÚBLICO ====================

class FrontendConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getConfig();
    this.performanceMetrics = [];
    this.initPerformanceMonitoring();
  }

  detectEnvironment() {
    // Detección automática de ambiente
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
        apiUrl: "", // Vacío para usar rutas relativas (localhost)
        apiTimeout: 30000,
        enableLogging: true,
      },
      production: {
        // En producción, necesitamos la URL completa del backend
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
      //console.log("[Frontend]", ...args);
    }
  }

  error(...args) {
    if (this.enableLogging) {
      console.error("[Frontend ERROR]", ...args);
    }
  }

  // ============ PERFORMANCE MONITORING ============

  initPerformanceMonitoring() {
    if (!this.enableLogging) return;

    // Monitorear Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.logMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.logMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              this.logMetric('CLS', clsScore);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        this.error('Error inicializando Performance Observer:', e);
      }
    }

    // Medir tiempo de carga inicial
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        this.logMetric('DOM Content Loaded', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
        this.logMetric('Total Load Time', perfData.loadEventEnd - perfData.fetchStart);
        this.logMetric('Time to Interactive', perfData.domInteractive - perfData.fetchStart);
      }
    });
  }

  logMetric(name, value) {
    if (!this.enableLogging) return;

    const metric = {
      name,
      value: Math.round(value),
      timestamp: Date.now(),
      url: window.location.pathname
    };

    this.performanceMetrics.push(metric);
    console.log(`[Performance] ${name}:`, `${metric.value}ms`);

    // Mantener solo los últimos 50 registros
    if (this.performanceMetrics.length > 50) {
      this.performanceMetrics.shift();
    }
  }

  // Medir latencia de API calls
  async measureApiCall(apiCallFn, label = 'API Call') {
    const startTime = performance.now();
    try {
      const result = await apiCallFn();
      const endTime = performance.now();
      this.logMetric(label, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.logMetric(`${label} (Error)`, endTime - startTime);
      throw error;
    }
  }

  // Medir tiempo de renderizado
  measureRender(renderFn, label = 'Render') {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    this.logMetric(label, endTime - startTime);
    return result;
  }

  // Obtener reporte de métricas
  getPerformanceReport() {
    if (!this.enableLogging) {
      return 'Performance logging disabled in production';
    }

    const report = {
      environment: this.environment,
      metrics: this.performanceMetrics,
      summary: {}
    };

    // Calcular promedios por tipo de métrica
    const metricsByType = {};
    this.performanceMetrics.forEach(m => {
      if (!metricsByType[m.name]) {
        metricsByType[m.name] = [];
      }
      metricsByType[m.name].push(m.value);
    });

    Object.keys(metricsByType).forEach(type => {
      const values = metricsByType[type];
      report.summary[type] = {
        avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    });

    return report;
  }

  // Limpiar métricas
  clearMetrics() {
    this.performanceMetrics = [];
  }
}

// Exportar instancia global
window.frontendConfig = new FrontendConfig();
