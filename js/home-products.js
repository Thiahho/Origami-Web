// Home products loader - Carga productos desde el backend
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".bottom-nav__item");

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      if (!this.classList.contains("bottom-nav__search-icon")) {
        navItems.forEach((nav) => {
          if (!nav.classList.contains("bottom-nav__search-icon")) {
            nav.classList.remove("active");
          }
        });
        this.classList.add("active");
      }
    });
  });

  const backgroundImages = ["/img/PLANTILLA 1.webp"];

  let currentImageIndex = 0;
  const body = document.body;

  function changeBackground() {
    const nextImage = new Image();
    const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    nextImage.src = backgroundImages[nextImageIndex];

    body.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;

    currentImageIndex = nextImageIndex;
  }

  changeBackground();

  const CARD_STYLE =
    "flex:0 0 260px; min-height:200px; padding:1.5rem; border-radius:var(--medium-radius);";

  const buildCardHtml = (product) => {
    const basePrice =
      product.variantes && product.variantes.length
        ? Math.min(...product.variantes.map((v) => v.precio))
        : null;
    const priceText = basePrice != null ? `$${basePrice}` : "";
    const imgBase64 = product.img || product.Img;
    const img = imgBase64
      ? `data:image/webp;base64,${imgBase64}`
      : "/img/LOGO+CIRCULO.webp";
    const productId = product.id ?? product.Id;
    const marca = product.Marca || product.marca || "Marca";
    const modelo = product.Modelo || product.modelo || "Modelo";
    const category = product.Categoria || product.categoria || "";

    return `
      <a href="DetalleProducto.html?id=${productId}" style="text-decoration:none; color:inherit;">
        <div class="glass-effect card" style="${CARD_STYLE}">
          <div style="text-align:center; margin-bottom:1rem; line-height:1;">
            <h3 style="font-size:1.3rem; font-weight:700; margin:0; line-height:1.1; color:var(--text-color);">${marca}</h3>
            <p style="font-size:0.95rem; font-weight:400; margin:0; line-height:1.2; color:var(--text-muted-color);">${modelo}</p>
          </div>
          <figure class="card__media">
            <img src="${img}" alt="${marca} ${modelo}" loading="lazy" decoding="async" width="220" height="200">
          </figure>
          <p>${category}</p>
          <div class="card__price">${priceText}</div>
        </div>
      </a>
    `;
  };

  const skeletonCard = () => `
    <div class="glass-effect card card--skeleton" style="${CARD_STYLE}">
      <div class="card__skeleton-title skeleton-block"></div>
      <div class="card__skeleton-subtitle skeleton-block"></div>
      <div class="card__media skeleton-block skeleton-media"></div>
      <div class="card__skeleton-desc skeleton-block"></div>
      <div class="card__skeleton-price skeleton-block"></div>
    </div>
  `;

  const renderSkeletons = (container, titleText) => {
    if (!container) return;
    const skeletons = Array.from({ length: 3 })
      .map(() => skeletonCard())
      .join("");
    container.innerHTML = `
      <h2 style="flex-basis:100%; margin:0 0 1rem 0;">${titleText}</h2>
      ${skeletons}
    `;
  };

  const renderProducts = (options) => {
    const { container, titleText, products, emptyText } = options;
    if (!container) return;

    if (!products.length) {
      container.innerHTML = `
        <h2 style="flex-basis:100%; margin:0 0 1rem 0;">${titleText}</h2>
        <div class="glass-effect card card--empty" style="padding:1rem; flex:0 0 100%; text-align:center;">${emptyText}</div>
      `;
      return;
    }

    const cardsHtml = products.map((p) => buildCardHtml(p)).join("");
    const viewMoreHtml = `
      <div style="flex-basis:100%; text-align:center;">
        <a href="Tienda.html" style="display:inline-block; padding:0.75rem 1.5rem; color:var(--text-color); text-decoration:none; font-weight:500; border-radius:8px; transition:background 0.3s ease;">Ver más</a>
      </div>
    `;

    container.innerHTML = `
      <h2 style="flex-basis:100%; margin:0 0 1rem 0;">${titleText}</h2>
      ${cardsHtml}
      ${viewMoreHtml}
    `;
  };

  const homeContainer = document.getElementById("home-products");
  const iphoneContainer = document.getElementById("home-iphone");

  if (!homeContainer || !iphoneContainer) {
    return;
  }

  renderSkeletons(homeContainer, "Nuestros Equipos");
  renderSkeletons(iphoneContainer, "Últimos iPhone");

  // Render dinámico de productos desde backend
  (async function loadHomeProducts() {
    try {
      let products = [];
      try {
        const apiUrl = window.frontendConfig
          ? window.frontendConfig.getApiUrl("/api/Producto/paged")
          : "/api/Producto/paged";
        const pagedUrl = new URL(apiUrl, window.location.origin);
        pagedUrl.searchParams.set("page", "1");
        pagedUrl.searchParams.set("pageSize", "30");
        const res = await fetch(pagedUrl.toString());
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        const data = await res.json();
        products = Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
      } catch (e) {
        console.warn("Paged endpoint falló, usando /api/Producto clásico:", e);
        const fallbackUrl = window.frontendConfig
          ? window.frontendConfig.getApiUrl("/api/Producto")
          : "/api/Producto";
        const fallback = await fetch(fallbackUrl);
        if (!fallback.ok) {
          throw new Error(`Error ${fallback.status}`);
        }
        const fallbackData = await fallback.json();
        products = Array.isArray(fallbackData)
          ? fallbackData
          : fallbackData?.items || [];
      }

      renderProducts({
        container: homeContainer,
        titleText: "Nuestros Equipos",
        products: products.slice(0, 3),
        emptyText: "No hay productos disponibles.",
      });

      const appleProducts = products.filter(
        (p) => (p.Marca || p.marca || "").toLowerCase() === "apple"
      );

      renderProducts({
        container: iphoneContainer,
        titleText: "Últimos iPhone",
        products: appleProducts.slice(0, 3),
        emptyText: "No hay productos Apple disponibles.",
      });
    } catch (e) {
      console.error("Error cargando productos del backend:", e);
    }
  })();
});
