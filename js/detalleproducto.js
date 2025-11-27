// ==================== detalleproducto.JS - Product Detail Page ====================

// Obtener el ID del producto desde la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let BASE = 0; // precio base (se actualizará con datos reales)
const fmt = (v) => "$" + v.toLocaleString("en-US");

// Variables que se inicializarán cuando el DOM esté listo
let img,
  priceEl,
  sumModel,
  sumRam,
  sumColor,
  sumCap,
  sumQty,
  sumCondicion,
  condicionValueEl;
let qtyHelpEl, plusBtn, minusBtn;

let colorDelta = 0,
  capDelta = 0,
  ramDelta = 0,
  qty = 1;

// Variables globales para variantes
let allVariants = [];

// Función de cálculo de precio
function calc() {
  const variant = getCurrentVariant();
  const unitPrice = variant ? variant.Precio || variant.precio || 0 : BASE;
  const total = unitPrice * qty;
  priceEl.textContent = fmt(total);

  // Mostrar stock si existe
  const stock = variant ? variant.Stock || variant.stock || 0 : 0;
  ////console.log("Precio:", unitPrice, "Stock:", stock);
  // Mostrar condición si existe
  const condicionName = variant
    ? variant.CondicionNombre || variant.condicionNombre || ""
    : "";
  if (sumCondicion) sumCondicion.textContent = condicionName || "-";
  if (condicionValueEl) condicionValueEl.textContent = condicionName || "-";

  // Enforce qty by stock and update UI state
  enforceQtyByStock(stock);
}

// Obtener variante actual según selección
function getCurrentVariant() {
  const selectedRam = document.querySelector("#ramRow .detalle-opt.is-active")
    ?.dataset.ram;
  const selectedColor = document.querySelector(".detalle-swatch.is-active")
    ?.dataset.color;
  const selectedStorage = document.querySelector(
    "#capRow .detalle-opt.is-active"
  )?.dataset.cap;

  /*  //console.log("Buscando variante:", {
    selectedRam,
    selectedColor,
    selectedStorage,
  }); */

  const found = allVariants.find((v) => {
    const vRam = v.Ram || v.ram;
    const vColor = v.Color || v.color;
    const vStorage = v.Almacenamiento || v.almacenamiento;

    return (
      vRam === selectedRam &&
      vColor === selectedColor &&
      vStorage === selectedStorage
    );
  });

  ////console.log("Variante encontrada:", found);
  return found;
}

// Filtrar opciones disponibles según selección
function filterAvailableOptions() {
  const selectedRam = document.querySelector("#ramRow .detalle-opt.is-active")
    ?.dataset.ram;
  const selectedStorage = document.querySelector(
    "#capRow .detalle-opt.is-active"
  )?.dataset.cap;

  ////console.log('Filtering options. Selected:', { selectedRam, selectedStorage });

  // Filtrar almacenamientos disponibles según RAM seleccionada
  if (selectedRam) {
    const availableStorages = [
      ...new Set(
        allVariants
          .filter((v) => (v.Ram || v.ram) === selectedRam)
          .map((v) => v.Almacenamiento || v.almacenamiento)
      ),
    ].filter(Boolean);

    ////console.log('Available storages for RAM', selectedRam, ':', availableStorages);

    document.querySelectorAll("#capRow .detalle-opt").forEach((btn) => {
      if (availableStorages.includes(btn.dataset.cap)) {
        btn.disabled = false;
        btn.style.opacity = "1";
      } else {
        btn.disabled = true;
        btn.style.opacity = "0.3";
      }
    });

    // Si el almacenamiento actual no está disponible, seleccionar el primero disponible
    if (selectedStorage && !availableStorages.includes(selectedStorage)) {
      const firstAvailable = document.querySelector(
        "#capRow .detalle-opt:not([disabled])"
      );
      if (firstAvailable) {
        document
          .querySelectorAll("#capRow .detalle-opt")
          .forEach((x) => x.classList.remove("is-active"));
        firstAvailable.classList.add("is-active");
        sumCap.textContent = firstAvailable.dataset.cap;
      }
    }
  }

  // Filtrar colores disponibles según RAM y Almacenamiento
  // IMPORTANTE: Solo filtrar si AMBOS están seleccionados
  if (selectedRam && selectedStorage) {
    const availableColors = [
      ...new Set(
        allVariants
          .filter(
            (v) =>
              (v.Ram || v.ram) === selectedRam &&
              (v.Almacenamiento || v.almacenamiento) === selectedStorage
          )
          .map((v) => v.Color || v.color)
      ),
    ].filter(Boolean);

    // //console.log('Available colors for', selectedRam, '+', selectedStorage, ':', availableColors);

    document.querySelectorAll(".detalle-swatch").forEach((btn) => {
      if (availableColors.includes(btn.dataset.color)) {
        btn.disabled = false;
        btn.style.opacity = "1";
      } else {
        btn.disabled = true;
        btn.style.opacity = "0.3";
      }
    });

    // Si el color actual no está disponible, seleccionar el primero disponible
    const selectedColor = document.querySelector(".detalle-swatch.is-active")
      ?.dataset.color;
    if (selectedColor && !availableColors.includes(selectedColor)) {
      const firstAvailable = document.querySelector(
        ".detalle-swatch:not([disabled])"
      );
      if (firstAvailable) {
        document
          .querySelectorAll(".detalle-swatch")
          .forEach((x) => x.classList.remove("is-active"));
        firstAvailable.classList.add("is-active");
        sumColor.textContent = firstAvailable.dataset.color;
      }
    }
  } else {
    // Si no hay RAM y almacenamiento seleccionados, habilitar todos los colores
    // //console.log('Not filtering colors - waiting for RAM and storage selection');
    document.querySelectorAll(".detalle-swatch").forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
    });
  }
}

// Event Listeners
function setupEventListeners() {
  // Colores
  document.getElementById("colorRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-swatch");
    if (!b || b.disabled) return;
    document
      .querySelectorAll(".detalle-swatch")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    colorDelta = +b.dataset.delta || 0;
    sumColor.textContent = b.dataset.color;
    if (b.dataset.img) img.src = b.dataset.img;
    calc();
  });

  // RAM
  document.getElementById("ramRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-opt");
    if (!b) return;
    document
      .querySelectorAll("#ramRow .detalle-opt")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    ramDelta = +b.dataset.delta || 0;
    sumRam.textContent = b.dataset.ram;

    // Filtrar opciones disponibles
    filterAvailableOptions();
    calc();
  });

  // Capacidad
  document.getElementById("capRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-opt");
    if (!b || b.disabled) return;
    document
      .querySelectorAll("#capRow .detalle-opt")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    capDelta = +b.dataset.delta || 0;
    sumCap.textContent = b.dataset.cap;

    // Filtrar opciones disponibles
    filterAvailableOptions();
    calc();
  });

  // Cantidad 1..5
  document.getElementById("qtyRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-opt");
    if (!b) return;
    const op = b.dataset.q;
    const current = getCurrentVariant();
    const stock = current ? current.Stock || current.stock || 0 : 0;
    if (op === "+1") qty = Math.min(stock > 0 ? stock : 0, qty + 1);
    if (op === "-1") qty = Math.max(1, qty - 1);
    document.getElementById("qty").textContent = qty;
    sumQty.textContent = qty;
    calc();
  });

  // Botón de consultar por WhatsApp
  document.getElementById("buyBtn").addEventListener("click", (e) => {
    const variant = getCurrentVariant();
    if (!variant) {
      alert("Seleccioná RAM, almacenamiento y color.");
      return;
    }

    // Número de WhatsApp (sin +, espacios ni guiones)
    const phoneNumber = "5491172376181";

    // Construir mensaje
    const model = document.getElementById("detalleModel")?.textContent || "Producto";
    const ram = document.querySelector("#ramRow .detalle-opt.is-active")?.dataset.ram || "";
    const storage = document.querySelector("#capRow .detalle-opt.is-active")?.dataset.cap || "";
    const color = document.querySelector(".detalle-swatch.is-active")?.dataset.color || "";
    const condicion = variant?.CondicionNombre || variant?.condicionNombre || "";
    const unitPrice = variant.Precio || variant.precio || 0;
    const total = unitPrice * qty;

    let message = `Hola, quisiera consultar por el siguiente producto:\n\n`;
    message += `📱 *${model}*\n`;
    message += `   RAM: ${ram}\n`;
    message += `   Almacenamiento: ${storage}\n`;
    if (color) message += `   Color: ${color}\n`;
    if (condicion) message += `   Condición: ${condicion}\n`;
    message += `   Cantidad: ${qty}\n`;
    message += `   💰 Precio unitario: ${fmt(unitPrice)}\n`;
    message += `   *Total: ${fmt(total)}*\n\n`;
    message += "¿Está disponible? ¡Espero tu respuesta! 😊";

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");
  });

  // Agregar al carrito
  const addBtn = document.getElementById("addToCartBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const variant = getCurrentVariant();
      if (!variant) {
        alert("Seleccioná RAM, almacenamiento y color.");
        return;
      }
      const stock = variant ? variant.Stock || variant.stock || 0 : 0;
      if (stock <= 0) {
        alert("Sin stock disponible para esta variante.");
        return;
      }

      const product = {
        productId,
        model:
          document.getElementById("detalleModel")?.textContent || "Producto",
        ram:
          document.querySelector("#ramRow .detalle-opt.is-active")?.dataset
            .ram || "",
        storage:
          document.querySelector("#capRow .detalle-opt.is-active")?.dataset
            .cap || "",
        color:
          document.querySelector(".detalle-swatch.is-active")?.dataset.color ||
          "",
        condicionNombre:
          variant?.CondicionNombre || variant?.condicionNombre || "",
        variantId: variant.Id || variant.id || `${productId}-${Date.now()}`,
        unitPrice: variant.Precio || variant.precio || BASE,
        qty: Math.max(1, Math.min(qty, stock)),
        stock: Number(stock) || 0,
        img: img?.src || "",
      };

      ////console.log("Adding to cart:", product);

      const key = "cart_items";
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = items.findIndex((x) => x.variantId === product.variantId);
      if (idx >= 0) {
        items[idx].qty = Math.min(
          stock,
          (Number(items[idx].qty) || 0) + product.qty
        );
      } else {
        items.push(product);
      }
      localStorage.setItem(key, JSON.stringify(items));

      showCartToast("Producto agregado al carrito");
      if (window.refreshCartBadge) window.refreshCartBadge();
    });
  }

  // Fallback para imagen
  img.addEventListener(
    "error",
    () => {
      img.src = "https://via.placeholder.com/600x600?text=Producto";
    },
    { once: true }
  );
}

// Ajusta cantidad y controles en base al stock disponible
function enforceQtyByStock(stock) {
  const maxQty = Math.max(0, Number(stock) || 0);
  if (qty > maxQty) {
    qty = maxQty;
    document.getElementById("qty").textContent = qty;
    if (sumQty) sumQty.textContent = qty;
  }
  // Siempre obtener referencias frescas (por si el DOM cambia)
  plusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="+1"]');
  minusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="-1"]');
  // Ayuda: el elemento siguiente a qtyRow dentro del mismo panel
  qtyHelpEl = document.querySelector("#qtyRow + .detalle-help");
  if (plusBtn) plusBtn.disabled = qty >= maxQty || maxQty === 0;
  if (minusBtn) minusBtn.disabled = qty <= 1 || maxQty === 0;
  const buyBtn = document.getElementById("buyBtn");
  if (buyBtn) buyBtn.disabled = maxQty === 0;
  if (qtyHelpEl)
    qtyHelpEl.textContent =
      maxQty === 0 ? "Sin stock disponible." : `Stock disponible: ${maxQty}`;
}

// Helper para obtener color hex aproximado
function getColorHex(colorName) {
  const colors = {
    white: "#f2f2f2",
    black: "#0b0b0c",
    blue: "#3b82f6",
    pink: "#ff80ab",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#fbbf24",
    purple: "#a855f7",
    silver: "#6b7280",
    orange: "#f97316",
    lavander: "#8C00FF",
    desert: "#FFE797",
    mid: "#132440",
    midnight: "#132440",
    graphito: "#7A7A73",
    star: "#F6F6F6",
  };
  return colors[colorName.toLowerCase()] || "#9ca3af";
}

// Cargar datos del producto desde la API
async function loadProductData() {
  if (!productId) {
    console.warn("No se especificó ID de producto");
    alert("No se especificó un producto válido");
    window.location.href = "Tienda.html";
    return;
  }

  try {
    // Cargar axios si no está disponible
    if (typeof axios === "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Obtener producto
    //console.log("Fetching product with ID:", productId);
    const apiUrl = window.frontendConfig ? window.frontendConfig.getApiUrl(`/api/Producto/${productId}`) : `/api/Producto/${productId}`;
    const res = await axios.get(apiUrl);
    const product = res.data;

    if (!product) {
      alert("Producto no encontrado");
      window.location.href = "Tienda.html";
      return;
    }

    //console.log("Product loaded:", product);

    // Actualizar título y modelo
    const modelo = `${product.Marca || product.marca || ""} ${
      product.Modelo || product.modelo || ""
    }`.trim();
    document.getElementById("detalleModel").textContent = modelo;
    sumModel.textContent = modelo;
    document.title = `${modelo} - Origami`;

    // Actualizar imagen principal
    const imgBase64 = product.Img || product.img;
    if (imgBase64) {
      img.src = `data:image/webp;base64,${imgBase64}`;
    }

    // Obtener variantes
    //console.log("Fetching variants for product ID:", productId);
    const variantesUrl = window.frontendConfig ? window.frontendConfig.getApiUrl(`/api/Producto/${productId}/variantes`) : `/api/Producto/${productId}/variantes`;
    const variantesRes = await axios.get(variantesUrl);
    //console.log("Variants API response:", variantesRes);
    const variantes = Array.isArray(variantesRes.data) ? variantesRes.data : [];

    //console.log("Variantes cargadas:", variantes);

    if (variantes.length === 0) {
      document.getElementById("colorRow").innerHTML =
        '<p style="color: var(--text-muted-color);">No hay variantes disponibles</p>';
      document.getElementById("ramRow").innerHTML =
        '<p style="color: var(--text-muted-color);">No disponible</p>';
      document.getElementById("capRow").innerHTML =
        '<p style="color: var(--text-muted-color);">No disponible</p>';
      document.getElementById("buyBtn").disabled = true;
      return;
    }

    // Guardar variantes globalmente
    allVariants = variantes;

    // Obtener opciones únicas de RAM, Almacenamiento y Color
    const ramOptions = [...new Set(variantes.map((v) => v.Ram || v.ram))]
      .filter(Boolean)
      .sort();
    const storageOptions = [
      ...new Set(variantes.map((v) => v.Almacenamiento || v.almacenamiento)),
    ]
      .filter(Boolean)
      .sort();
    const colorOptions = [
      ...new Set(variantes.map((v) => v.Color || v.color)),
    ].filter(Boolean);

    //console.log("Opciones:", {
    /*   ramOptions,
      storageOptions,
      colorOptions,
    }); */

    // Construir botones de RAM
    const ramRow = document.getElementById("ramRow");
    ramRow.innerHTML = "";
    ramOptions.forEach((ram, idx) => {
      const btn = document.createElement("button");
      btn.className = "detalle-opt" + (idx === 0 ? " is-active" : "");
      btn.dataset.ram = ram;
      btn.dataset.delta = 0;
      btn.textContent = ram;
      ramRow.appendChild(btn);
    });

    // Construir botones de color (solo círculo sin texto)
    const colorRow = document.getElementById("colorRow");
    colorRow.innerHTML = "";
    colorOptions.forEach((color, idx) => {
      const btn = document.createElement("button");
      btn.className = "detalle-swatch" + (idx === 0 ? " is-active" : "");
      btn.title = color;
      btn.dataset.color = color;
      btn.dataset.delta = 0;
      btn.dataset.img = imgBase64 ? `data:image/webp;base64,${imgBase64}` : "";
      btn.style.setProperty("--c", getColorHex(color));

      colorRow.appendChild(btn);
    });

    // Construir botones de almacenamiento
    const capRow = document.getElementById("capRow");
    capRow.innerHTML = "";
    storageOptions.forEach((storage, idx) => {
      const btn = document.createElement("button");
      btn.className = "detalle-opt" + (idx === 0 ? " is-active" : "");
      btn.dataset.cap = storage;
      btn.dataset.delta = 0;
      btn.textContent = storage;
      capRow.appendChild(btn);
    });

    // Actualizar precio base con la primera variante
    const firstVariant = variantes[0];
    BASE = firstVariant ? firstVariant.Precio || firstVariant.precio || 0 : 0;

    // Actualizar summary inicial
    sumRam.textContent = ramOptions[0] || "N/A";
    sumColor.textContent = colorOptions[0] || "N/A";
    sumCap.textContent = storageOptions[0] || "N/A";
    // Asignar condición inicial si viene en la primera variante
    const initCond =
      firstVariant?.CondicionNombre || firstVariant?.condicionNombre || "-";
    if (sumCondicion) sumCondicion.textContent = initCond;
    if (condicionValueEl) condicionValueEl.textContent = initCond;

    // Aplicar filtros iniciales según la primera RAM seleccionada
    filterAvailableOptions();

    // Calcular precio inicial
    calc();
  } catch (error) {
    console.error("Error cargando producto:", error);
    console.error("Error details:", error.response?.data || error.message);
    alert(
      "Error al cargar el producto: " +
        (error.response?.data?.message || error.message)
    );
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar referencias a elementos DOM
  img = document.getElementById("detalleImg");
  priceEl = document.getElementById("price");
  sumModel = document.getElementById("sumModel");
  sumRam = document.getElementById("sumRam");
  sumColor = document.getElementById("sumColor");
  sumCap = document.getElementById("sumCap");
  sumQty = document.getElementById("sumQty");
  sumCondicion = document.getElementById("sumCondicion");
  condicionValueEl = document.getElementById("condicionValue");
  plusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="+1"]');
  minusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="-1"]');
  qtyHelpEl = document.querySelector("#qtyRow + .detalle-help");

  //console.log("DOM loaded. Product ID:", productId);
  //console.log("Elements initialized:", { img, priceEl, sumModel });

  setupEventListeners();
  loadProductData();
});

// Notificación simple "agregado al carrito"
function showCartToast(message) {
  const toast = document.createElement("div");
  toast.className = "store-notification";
  toast.innerHTML = `<i class="fa-solid fa-check"></i> ${message}`;
  // estilos si no existen (reusa estilos de store-integration)
  if (!document.querySelector("#notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
    styles.textContent = `
      .store-notification { position: fixed; top: 100px; right: 20px; background: rgba(76,175,80,.9); backdrop-filter: blur(10px); border:1px solid rgba(76,175,80,.3); border-radius:15px; padding: .8rem 1.2rem; color:#fff; z-index: 9999; display:flex; align-items:center; gap:.5rem; animation: slideInRight .3s ease; font-size:.9rem; }
      @keyframes slideInRight { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
    `;
    document.head.appendChild(styles);
  }
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideInRight .3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
