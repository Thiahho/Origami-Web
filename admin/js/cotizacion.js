// ==================== COTIZACIÓN MANAGER ====================
// Gestiona la cotización del día para conversión automática de precios

class CotizacionManager {
  constructor() {
    this.storageKey = 'origami_cotizacion_dia';
    this.init();
  }

  init() {
    // Inicializar con valor por defecto si no existe
    if (!this.getCotizacion()) {
      this.setCotizacion(1);
    }
  }

  // Obtener la cotización actual
  getCotizacion() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return {
        valor: parseFloat(parsed.valor) || 1,
        fecha: parsed.fecha,
        moneda: parsed.moneda || 'USD'
      };
    } catch (e) {
      console.error('Error al obtener cotización:', e);
      return null;
    }
  }

  // Establecer nueva cotización
  setCotizacion(valor, moneda = 'USD') {
    const data = {
      valor: parseFloat(valor),
      fecha: new Date().toISOString(),
      moneda: moneda
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));

    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('cotizacionUpdated', { detail: data }));

    return data;
  }

  // Calcular precio final basado en cotización
  calcularPrecio(precioBase) {
    const cotizacion = this.getCotizacion();
    if (!cotizacion) return precioBase;

    return (parseFloat(precioBase) * cotizacion.valor).toFixed(2);
  }

  // Obtener precio base desde precio final
  obtenerPrecioBase(precioFinal) {
    const cotizacion = this.getCotizacion();
    if (!cotizacion || cotizacion.valor === 0) return precioFinal;

    return (parseFloat(precioFinal) / cotizacion.valor).toFixed(2);
  }

  // Formatear para display
  formatearCotizacion() {
    const cotizacion = this.getCotizacion();
    if (!cotizacion) return 'No configurada';

    const fecha = new Date(cotizacion.fecha);
    const fechaStr = fecha.toLocaleDateString('es-AR');

    return `${cotizacion.moneda} $${cotizacion.valor.toFixed(2)} (${fechaStr})`;
  }
}

// Instancia global
window.cotizacionManager = new CotizacionManager();
