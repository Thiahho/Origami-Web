// ==================== Condiciones CONTROLLER ====================

class CondicionesController {
  constructor() {
    this.condiciones = [];
    this.filteredCondiciones = [];
    this.condicionToDelete = null;

    this.init();
  }

  init() {
    try {
      localStorage.removeItem("admin_condiciones");
    } catch (e) {
      /* ignore */
    }
    this.loadCondiciones();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.filterCondiciones(e.target.value);
    });

    // Category form
    document.getElementById("condicionForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCondicion();
    });

    // Global functions
    window.refreshCondiciones = () => this.loadCondiciones();
    window.openCondicionModal = (id = null) => this.openCondicionModal(id);
    window.closeCondicionModal = () => this.closeCondicionModal();
    window.editCondicion = (id) => this.openCondicionModal(id);
    window.deleteCondicion = (id) => this.deleteCondicion(id);
    window.closeDeleteModal = () => this.closeDeleteModal();
    window.confirmDelete = () => this.confirmDelete();
    window.viewCondicionProducts = (id) => this.viewCondicionProducts(id);
  }

  loadCondiciones() {
    try {
      const grid = document.getElementById("condicionesGrid");
      if (grid) grid.innerHTML = "";
      if (
        window.apiService &&
        typeof window.apiService.getCondiciones === "function"
      ) {
        window.apiService
          .getCondiciones()
          .then((data) => {
            // //console.log("[Condiciones] API data:", data);
            const list = Array.isArray(data) ? data : data?.items || [];
            this.condiciones = list.map((c) => ({
              id: c.id ?? c.Id,
              name: c.nombre || c.Nombre || c.name || "",
              description: c.descripcion || c.Descripcion || "",
              createdAt: c.createdAt || c.CreatedAt || new Date().toISOString(),
            }));
            this.filteredCondiciones = [...this.condiciones];
            this.renderCondiciones();
          })
          .catch((err) => {
            console.error("API getCondiciones error:", err);
            this.showError("Error al cargar las condiciones");
            this.filteredCondiciones = [];
            this.renderCondiciones();
          });
      } else {
        console.warn(
          "[Condiciones] API no disponible. No se mostrarán datos locales."
        );
        this.condiciones = [];
        this.filteredCondiciones = [];
        this.renderCondiciones();
      }
    } catch (error) {
      console.error("Error loading condiciones:", error);
      this.showError("Error al cargar las condiciones");
    }
  }

  filterCondiciones(searchTerm) {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredCondiciones = [...this.condiciones];
    } else {
      this.filteredCondiciones = this.condiciones.filter(
        (condicion) =>
          condicion.name.toLowerCase().includes(search) ||
          condicion.description.toLowerCase().includes(search)
      );
    }

    this.renderCondiciones();
  }

  renderCondiciones() {
    const grid = document.getElementById("condicionesGrid");
    const emptyState = document.getElementById("emptyState");
    if (grid) grid.innerHTML = "";

    if (this.filteredCondiciones.length === 0) {
      if (grid) grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    // Get product counts for each category
    const productCounts = {}; // Opcional: integrar vía API en el futuro

    grid.innerHTML = this.filteredCondiciones
      .map((condicion) => {
        const productCount = productCounts[condicion.id] || 0;

        return `
        <div class="condicion-card glass-effect">
          <div class="condicion-header">
            <div class="condicion-actions">
              <button class="btn btn-small btn-secondary" onclick="editCondicion('${
                condicion.id
              }')" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-small btn-danger" onclick="deleteCondicion('${
                condicion.id
              }')" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="condicion-content">
            <h3 class="condicion-name">${condicion.name}</h3>
            <p class="condicion-description">${
              condicion.description || "Sin descripción"
            }</p>
          </div>

          <div class="condicion-footer">
            <div class="condicion-stats">
              <span class="product-count">
                <i class="fa-solid fa-box"></i>
                ${productCount} producto${productCount !== 1 ? "s" : ""}
              </span>
            </div>
            ${
              productCount > 0
                ? `
              <button class="btn btn-small btn-primary" onclick="viewCondicionProducts('${condicion.id}')">
                Ver Condiciones
              </button>
            `
                : ""
            }
          </div>

          <div class="condicion-meta">
            <small>Creada: ${new Date(
              condicion.createdAt
            ).toLocaleDateString()}</small>
          </div>
        </div>
      `;
      })
      .join("");

    this.addCondicionGridStyles();
  }

  openCondicionModal(condicionId = null) {
    const modal = document.getElementById("condicionModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("condicionForm");

    if (condicionId) {
      const fillForm = (c) => {
        if (!c) return;
        modalTitle.textContent = "Editar Condición";
        document.getElementById("condicionId").value = c.id ?? c.Id;
        document.getElementById("condicionName").value =
          c.nombre || c.Nombre || c.name || "";
        document.getElementById("condicionDescription").value =
          c.descripcion || c.Descripcion || c.description || "";
        modal.classList.add("active");
      };

      const inMemory = (this.condiciones || []).find(
        (x) =>
          String(x.id) === String(condicionId) ||
          String(x.Id) === String(condicionId)
      );
      if (inMemory) {
        fillForm(inMemory);
      } else if (
        window.apiService &&
        typeof window.apiService.getCondicion === "function"
      ) {
        window.apiService
          .getCondicion(condicionId)
          .then((data) => fillForm(data))
          .catch(() => {
            this.showError("Condición no encontrada");
          });
      } else {
        this.showError("Condición no encontrada");
      }
    } else {
      modalTitle.textContent = "Nueva Condición";
      form.reset();
      document.getElementById("condicionId").value = "";
      modal.classList.add("active");
    }
  }

  closeCondicionModal() {
    const modal = document.getElementById("condicionModal");
    modal.classList.remove("active");
  }

  saveCondicion() {
    try {
      const formData = new FormData(document.getElementById("condicionForm"));
      const condicionId = document.getElementById("condicionId").value;

      const condicionData = {
        name: formData.get("name").trim(),
        description: formData.get("description").trim(),
      };

      if (!condicionData.name) {
        this.showError("El nombre de la condición es obligatorio");
        return;
      }

      const after = () => {
        this.showSuccess(
          condicionId
            ? "Condición actualizada correctamente"
            : "Condición creada correctamente"
        );
        this.closeCondicionModal();
        this.loadCondiciones();
      };

      if (
        window.apiService &&
        typeof window.apiService.createCondicion === "function"
      ) {
        const payload = condicionId
          ? {
              Nombre: condicionData.name,
              Descripcion: condicionData.description || "",
              Orden: 0,
              Activo: true,
            }
          : {
              Nombre: condicionData.name,
              Descripcion: condicionData.description || "",
              Orden: 0,
              Activo: true,
            };

        if (condicionId) {
          window.apiService
            .updateCondicion(condicionId, payload)
            .then(after)
            .catch((err) => {
              console.error("API updateCondicion error:", err);
              const errorMsg =
                err.data?.message ||
                err.message ||
                "Error al actualizar la condición";
              this.showError(errorMsg);
            });
        } else {
          window.apiService
            .createCondicion(payload)
            .then(after)
            .catch((err) => {
              console.error("API createCondicion error:", err);
              const errorMsg =
                err.data?.message ||
                err.message ||
                "Error al crear la condición";
              this.showError(errorMsg);
            });
        }
      } else {
        this.showError("API no disponible");
      }
    } catch (error) {
      console.error("Error saving condicion:", error);
      this.showError("Error al guardar la condición");
    }
  }

  deleteCondicion(condicionId) {
    // El backend validará si hay productos asociados
    this.condicionToDelete = condicionId;
    const modal = document.getElementById("deleteModal");
    modal.classList.add("active");
  }

  closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("active");
    this.condicionToDelete = null;
  }

  confirmDelete() {
    if (!this.condicionToDelete) return;

    try {
      const after = () => {
        this.showSuccess("Condición eliminada correctamente");
        this.closeDeleteModal();
        this.loadCondiciones();
      };

      if (
        window.apiService &&
        typeof window.apiService.deleteCondicion === "function"
      ) {
        window.apiService
          .deleteCondicion(this.condicionToDelete)
          .then(after)
          .catch((err) => {
            console.error("API deleteCondicion error:", err);
            this.closeDeleteModal();
            const errorMsg =
              err.data?.message ||
              err.message ||
              "Error al eliminar la condición";
            this.showError(errorMsg);
          });
      } else {
        this.showError("API no disponible");
      }
    } catch (error) {
      console.error("Error deleting condicion:", error);
      this.showError("Error al eliminar la condición");
    }
  }

  viewCondicionProducts(condicionId) {
    // Redirect to products page with category filter
    window.location.href = `products.html?condicion=${condicionId}`;
  }

  addCondicionGridStyles() {
    if (document.querySelector("#condicion-grid-styles")) return;

    const styles = document.createElement("style");
    styles.id = "condicion-grid-styles";
    styles.textContent = `
      .condiciones-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }

      .condicion-card {
        padding: 1.5rem;
        border-radius: var(--medium-radius);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .condicion-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 48px rgba(0,0,0,.42);
        background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08));
        border-color: rgba(255,255,255,.34);
      }

      .condicion-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      

      .condicion-actions {
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .condicion-card:hover .condicion-actions {
        opacity: 1;
      }

      .condicion-content {
        flex: 1;
      }

      .condicion-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .condicion-description {
        color: var(--text-muted-color);
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0 0 0.5rem 0;
      }

     
      .condicion-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .condicion-stats {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .product-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted-color);
        font-size: 0.85rem;
      }

      .condicion-meta {
        margin-top: 0.5rem;
        text-align: right;
        color: var(--text-muted-color);
        font-size: 0.75rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-muted-color);
      }

      .empty-state i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: var(--active-text-color);
      }

      .empty-state h3 {
        margin: 0 0 1rem 0;
        color: var(--text-color);
      }

      .empty-state p {
        margin: 0 0 2rem 0;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }

      .icon-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--nav-item-radius);
        border: 1px solid var(--border-color);
      }

      .icon-preview i {
        font-size: 2rem;
        color: var(--active-text-color);
      }

      .icon-preview span {
        font-family: 'Courier New', monospace;
        color: var(--text-muted-color);
        font-size: 0.9rem;
      }

      .form-help {
        color: var(--text-muted-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: block;
      }

      .delete-warning {
        text-align: center;
        padding: 2rem 1rem;
      }

      .delete-warning i {
        font-size: 3rem;
        color: #0b64a1;
        margin-bottom: 1rem;
      }

      .delete-warning p {
        margin: 0.5rem 0;
        color: var(--text-color);
      }

      .warning-text {
        color: var(--text-muted-color);
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .condiciones-grid {
          grid-template-columns: 1fr;
        }

        .condicion-actions {
          opacity: 1;
        }

        .condicion-footer {
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }
      }
    `;

    document.head.appendChild(styles);
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
// Initialize condiciones controller when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.condicionesController = new CondicionesController();
});
