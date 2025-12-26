// ==================== FORM VARIANTE COMPONENT ====================

class FormVariante {
  constructor() {
    this.isEditMode = false;
    this.currentVariantId = null;
    this.formBound = false;
    this.typeBound = false;
    this.previewBound = false;
    this.init();
  }

  init() {
    this.loadProducts();
    this.bindFormHandlers();
    this.setupTypeFields();
    this.setupPreview();
    this.loadCondiciones();
    // Global functions
    window.openVariantModal = (id = null) => this.openModal(id);
    window.closeVariantModal = () => this.closeModal();
  }

  /* setupCotizacion() {
    // Actualizar display de cotización
    this.updateCotizacionDisplay();

    // Escuchar cambios en precio base para calcular precio final
    const precioBaseInput = document.getElementById("productPrecioBase");
    const precioFinalInput = document.getElementById("productBasePrice");

    if (precioBaseInput && precioFinalInput) {
      precioBaseInput.addEventListener("input", (e) => {
        this.calcularPrecioFinal();
      });
    }

    // Escuchar cambios en la cotización
    window.addEventListener("cotizacionUpdated", () => {
      this.updateCotizacionDisplay();
      this.calcularPrecioFinal();
    });
  }

  updateCotizacionDisplay() {
    const display = document.getElementById("cotizacionDisplay");
    const monedaLabel = document.getElementById("monedaBaseLabel");

    if (display && window.cotizacionManager) {
      const cotizacion = window.cotizacionManager.getCotizacion();
      if (cotizacion) {
        display.textContent = `${cotizacion.moneda} $${cotizacion.valor.toFixed(
          2
        )}`;
        display.style.color = "#4CAF50";

        if (monedaLabel) {
          monedaLabel.textContent = cotizacion.moneda;
        }
      } else {
        display.textContent = 'No configurada - Click en "Cambiar"';
        display.style.color = "#FF9800";
      }
    }
  }

  calcularPrecioFinal() {
    const precioBaseInput = document.getElementById("productPrecioBase");
    const precioFinalInput = document.getElementById("productBasePrice");

    if (precioBaseInput && precioFinalInput && window.cotizacionManager) {
      const precioBase = parseFloat(precioBaseInput.value) || 0;
      const precioFinal = window.cotizacionManager.calcularPrecio(precioBase);
      precioFinalInput.value = precioFinal;
    }
  } */

  bindFormHandlers() {
    const form = document.getElementById("variantForm");
    if (form && !this.formBound) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveVariant();
      });
      this.formBound = true;
    }
  }

  setupTypeFields() {
    // Este método ya no es necesario ya que el formulario no tiene campo variantType
    // El formulario siempre muestra Ram, Almacenamiento y Color
    this.typeBound = true;
  }

  setupPreview() {
    const colorPicker = document.getElementById("variantColorHex");
    const colorText = document.getElementById("variantColorText");
    if (this.previewBound) return;

    if (colorPicker && colorText) {
      colorPicker.addEventListener("input", (e) => {
        colorText.value = e.target.value;
        this.updatePreview();
      });
      colorText.addEventListener("input", (e) => {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          colorPicker.value = color;
        }
        this.updatePreview();
      });
    }

    const imageField = document.getElementById("variantImage");
    if (imageField) {
      imageField.addEventListener("input", () => this.updatePreview());
    }

    this.previewBound = true;
  }

  updatePreview() {
    const colorHex = document.getElementById("variantColorHex")?.value || "";
    const image = document.getElementById("variantImage")?.value || "";

    const previewColor = document.getElementById("previewColor");
    const previewText = document.getElementById("previewText");
    const previewImage = document.getElementById("previewImage");

    if (!previewText) return;

    // Reset
    if (previewColor) previewColor.style.display = "none";
    if (previewImage) previewImage.style.display = "none";
    previewText.textContent = "Sin vista previa";

    if (colorHex && previewColor) {
      previewColor.style.backgroundColor = colorHex;
      previewColor.style.display = "block";
      previewText.textContent = `Color: ${colorHex}`;
    }

    if (image && previewImage) {
      previewImage.src = image;
      previewImage.style.display = "block";
      previewImage.onerror = () => {
        previewImage.style.display = "none";
      };
    }
  }

  // Convertir archivo de imagen a base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Obtener solo la parte base64 (remover el prefijo data:image/...;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Configurar preview de imagen
  setupImagePreview() {
    const imagenInput = document.getElementById("variantImagen");
    const removeBtn = document.getElementById("removeVariantImage");

    if (imagenInput) {
      imagenInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.showImagePreview(ev.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        this.hideImagePreview();
        imagenInput.value = "";
      });
    }
  }

  // Cargar imagen existente de variante
  loadExistingVariantImage(variant) {
    const imagen = variant.imagen || variant.Imagen;
    if (imagen) {
      const imageSrc = `data:image/webp;base64,${imagen}`;
      this.showImagePreview(imageSrc);
    } else {
      this.hideImagePreview();
    }
  }

  // Mostrar preview de imagen
  showImagePreview(imageSrc) {
    const preview = document.getElementById("variantImagePreview");
    const previewImg = document.getElementById("variantImagePreviewImg");

    if (preview && previewImg) {
      previewImg.src = imageSrc;
      preview.style.display = "block";
    }
  }

  // Ocultar preview de imagen
  hideImagePreview() {
    const preview = document.getElementById("variantImagePreview");
    const previewImg = document.getElementById("variantImagePreviewImg");

    if (preview && previewImg) {
      previewImg.src = "";
      preview.style.display = "none";
    }
  }

  loadCondiciones() {
    const variantCondicion = document.getElementById("variantCondicion");
    if (!variantCondicion) return Promise.resolve();
    variantCondicion.innerHTML =
      '<option value="">Seleccionar condición</option>';

    const fillOptions = (condiciones) => {
      condiciones.forEach((c) => {
        const id = c.id ?? c.Id;
        const nombre = c.nombre || c.Nombre || "";
        if (id && nombre) {
          const option = new Option(nombre, id);
          variantCondicion.appendChild(option);
        }
      });
    };

    if (
      window.apiService &&
      typeof window.apiService.getCondiciones === "function"
    ) {
      return window.apiService
        .getCondiciones()
        .then((list) => {
          const condiciones = Array.isArray(list) ? list : list?.items || [];
          if (
            condiciones.length === 0 &&
            typeof window.apiService.getCondicionesActivas === "function"
          ) {
            return window.apiService.getCondicionesActivas().then(fillOptions);
          }
          fillOptions(condiciones);
        })
        .catch((err) => {
          console.error("Error cargando condiciones para variantes:", err);
          if (typeof window.apiService.getCondicionesActivas === "function") {
            return window.apiService
              .getCondicionesActivas()
              .then((list) => {
                const condiciones = Array.isArray(list)
                  ? list
                  : list?.items || [];
                fillOptions(condiciones);
              })
              .catch((e) =>
                console.error("Fallback condiciones activas también falló:", e)
              );
          }
        });
    }
    return Promise.resolve();
  }

  loadProducts() {
    const variantProduct = document.getElementById("variantProduct");
    return new Promise((resolve) => {
      if (!variantProduct) {
        resolve();
        return;
      }
      variantProduct.innerHTML =
        '<option value="">Seleccionar producto</option>';
      if (
        window.apiService &&
        typeof window.apiService.getProducts === "function"
      ) {
        window.apiService
          .getProducts()
          .then((list) => {
            const products = Array.isArray(list) ? list : list?.items || [];
            products.forEach((p) => {
              const marca = p.marca || p.Marca || "";
              const modelo = p.modelo || p.Modelo || "";
              const id = p.id ?? p.Id;
              const display = `${marca} ${modelo}`.trim() || `${id}`;
              const option = new Option(display, id);
              variantProduct.appendChild(option);
            });
            resolve();
          })
          .catch((err) => {
            console.error("Error cargando productos para variantes:", err);
            resolve();
          });
      } else {
        resolve();
      }
    });
  }

  openModal(variantId = null) {
    const modal = document.getElementById("variantModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("variantForm");

    if (!modal || !form) {
      console.error("Modal o formulario no encontrado");
      return;
    }

    // Ensure bindings
    this.bindFormHandlers();
    this.setupTypeFields();
    this.setupPreview();
    this.setupImagePreview();

    if (variantId) {
      this.isEditMode = true;
      this.currentVariantId = variantId;

      // Cargar variante desde API
      window.apiService
        .getVariant(variantId)
        .then((variant) => {
          modalTitle.textContent = "Editar Variante";
          document.getElementById("variantId").value = variant.id || variant.Id;
          const productIdVariant = variant.productoId || variant.ProductoId;
          const condicionIdVariant = variant.condicionId || variant.CondicionId;

          // Cargar productos y condiciones primero, luego establecer valores
          Promise.all([
            this.loadProducts(),
            this.loadCondiciones()
          ]).then(() => {
            document.getElementById("variantProduct").value = productIdVariant;
            document.getElementById("variantCondicion").value = condicionIdVariant || "";
          });

          // COMENTADO: Ya no se carga RAM
          // document.getElementById("variantRam").value =
          //   variant.ram || variant.Ram || "";
          document.getElementById("variantStorage").value =
            variant.almacenamiento || variant.Almacenamiento || "";
          document.getElementById("variantColor").value =
            variant.color || variant.Color || "";

          // Establecer precio base (USD)
          const precioBase = variant.precio || variant.Precio || 0;
          document.getElementById("productPrecioBase").value = precioBase;

          document.getElementById("productBaseStock").value =
            variant.stock || variant.Stock || 0;
          const baseCondInput = document.getElementById("productBaseCondicion");
          if (baseCondInput) {
            baseCondInput.value =
              variant.condicionId || variant.CondicionId || "";
          }

          // Cargar imagen existente si existe
          this.loadExistingVariantImage(variant);

          this.updatePreview();
          modal.classList.add("active");
        })
        .catch((err) => {
          console.error("Error cargando variante:", err);
          this.showError("Error al cargar la variante");
        });
    } else {
      this.isEditMode = false;
      this.currentVariantId = null;
      modalTitle.textContent = "Nueva Variante";
      form.reset();
      document.getElementById("variantId").value = "";
      this.loadProducts();
      this.loadCondiciones();

      // Limpiar campo de precio
      document.getElementById("productPrecioBase").value = "";

      // Ocultar preview de imagen
      this.hideImagePreview();

      this.updatePreview();
      modal.classList.add("active");
    }
  }

  closeModal() {
    const modal = document.getElementById("variantModal");
    modal.classList.remove("active");
  }

  async saveVariant() {
    try {
      const formData = new FormData(document.getElementById("variantForm"));
      const variantId = document.getElementById("variantId").value;

      const variantData = {
        productId: formData.get("productId"),
        // COMENTADO: Ya no se obtiene RAM del formulario
        // ram: (formData.get("ram") || "").trim(),
        storage: (formData.get("storage") || "").trim(),
        color: (formData.get("color") || "").trim(),
        price: parseFloat(formData.get("precioBase")) || 0,
        stock: parseInt(formData.get("stock")) || 0,
        condicionId: parseInt(formData.get("condicionId")) || null,
      };

      if (variantData.type === "color") {
        variantData.colorHex = formData.get("colorHex");
      }

      // Validación de campos obligatorios
      if (!variantData.productId) {
        this.showError("Debes seleccionar un producto");
        return;
      }
      // COMENTADO: Ya no se valida RAM
      // if (!variantData.ram) {
      //   this.showError("La RAM es obligatoria");
      //   return;
      // }
      // COMENTADO: Almacenamiento ahora es opcional (nullable)
      // if (!variantData.storage) {
      //   this.showError("El almacenamiento es obligatorio");
      //   return;
      // }
      // COMENTADO: Color ahora es opcional (nullable)
      // if (!variantData.color) {
      //   this.showError("El color es obligatorio");
      //   return;
      // }
      if (!variantData.condicionId) {
        this.showError("La condición es obligatoria");
        return;
      }
      if (variantData.price <= 0) {
        this.showError("El precio debe ser mayor a 0");
        return;
      }
      if (variantData.stock < 0) {
        this.showError("El stock no puede ser negativo");
        return;
      }

      const payload = {
        ProductoId: parseInt(variantData.productId),
        // COMENTADO: Ya no se envía RAM en el payload
        // Ram: variantData.ram,
        Almacenamiento: variantData.storage || null, // null si está vacío
        Color: variantData.color || null,
        Precio: variantData.price,
        Stock: variantData.stock,
        CondicionId: variantData.condicionId,
        Activo: true, // Nueva variante siempre se crea activa
      };

      // Capturar imagen si existe
      const imagenInput = document.getElementById("variantImagen");
      if (imagenInput && imagenInput.files && imagenInput.files[0]) {
        try {
          const imagenBase64 = await this.fileToBase64(imagenInput.files[0]);
          payload.Imagen = imagenBase64;
        } catch (err) {
          console.error("Error al convertir imagen:", err);
          this.showError("Error al procesar la imagen");
          return;
        }
      }

      const after = () => {
        this.showSuccess(
          variantId
            ? "Variante actualizada correctamente"
            : "Variante creada correctamente"
        );
        this.closeModal();
        if (window.variantsController) {
          window.variantsController.loadVariants();
        }
        if (window.refreshVariants) {
          window.refreshVariants();
        }
      };

      if (variantId) {
        payload.Id = parseInt(variantId);

        // Log para debug
        //console.log("Enviando payload para actualizar:", { ...payload, Imagen: payload.Imagen ? `[${payload.Imagen.length} chars]` : 'null' });

        window.apiService
          .updateVariant(variantId, payload)
          .then(after)
          .catch((err) => {
            console.error("Error API al actualizar variante:", err);

            // Mostrar mensaje más específico según el error
            let errorMessage = "Error al actualizar la variante";
            if (err.data && typeof err.data === 'string') {
              errorMessage = err.data;
            } else if (err.message) {
              errorMessage = err.message;
            }

            this.showError(errorMessage);
          });
      } else {
        window.apiService
          .createVariant(payload)
          .then(after)
          .catch((err) => {
            console.error("Error API al crear variante:", err);

            // Mostrar mensaje más específico según el error
            let errorMessage = "Error al crear la variante";
            if (err.data && typeof err.data === 'string') {
              errorMessage = err.data;
            } else if (err.message) {
              errorMessage = err.message;
            }

            this.showError(errorMessage);
          });
      }
    } catch (err) {
      console.error("Error saving variant:", err);
      this.showError("Error al guardar la variante");
    }
  }

  showSuccess(message) {
    this.showToast(message, "success");
  }
  showError(message) {
    this.showToast(message, "error");
  }
  showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${
        type === "success" ? "check-circle" : "exclamation-circle"
      }"></i>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize after DOM and component load if present
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el DOM del componente está disponible
  const checkAndInit = () => {
    if (document.getElementById("variantForm")) {
      //////console.log('Initializing FormVariante component...');
      window.formVariante = new FormVariante();
      //////console.log('FormVariante initialized:', !!window.formVariante);
    } else {
      // Si no está disponible, intentar de nuevo en breve
      setTimeout(checkAndInit, 100);
    }
  };

  refreshCondiciones = () => {
    this.loadCondiciones();
  };

  checkAndInit();
});
