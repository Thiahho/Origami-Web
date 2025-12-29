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

  // Render dinámico de productos desde backend
  (async function loadHomeProducts() {
    try {
      if (typeof axios === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      let products = [];
      try {
        const apiUrl = window.frontendConfig ? window.frontendConfig.getApiUrl("/api/Producto/paged") : "/api/Producto/paged";
        const res = await axios.get(apiUrl, {
          params: { page: 1, pageSize: 30 },
        });
        const data = res.data || {};
        products = Array.isArray(data.items)
          ? data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
      } catch (e) {
        console.warn("Paged endpoint falló, usando /api/Producto clásico:", e);
        const fallbackUrl = window.frontendConfig ? window.frontendConfig.getApiUrl("/api/Producto") : "/api/Producto";
        const fallback = await axios.get(fallbackUrl);
        products = Array.isArray(fallback.data)
          ? fallback.data
          : fallback.data?.items || [];
      }
      const container = document.getElementById("home-products");
      const iphoneContainer = document.getElementById("home-iphone");

      // Generar HTML de productos en lote (más eficiente)
      const cardsHTML = products.slice(0, 3).map((p) => {
        const basePrice =
          p.variantes && p.variantes.length
            ? Math.min(...p.variantes.map((v) => v.precio))
            : null;
        const priceText = basePrice != null ? `$${basePrice}` : "";
        const imgBase64 = p.img || p.Img;
        const img = imgBase64
          ? `data:image/webp;base64,${imgBase64}`
          : "/img/LOGO+CIRCULO.webp";
        const productId = p.id ?? p.Id;
        const marca = p.Marca || p.marca || "Marca";
        const modelo = p.Modelo || p.modelo || "Modelo";
        const categoria = p.Categoria || p.categoria || "";

        return `
          <a href="DetalleProducto.html?id=${productId}" style="text-decoration:none; color:inherit;">
            <div class="glass-effect card" style="flex:0 0 260px; min-height:200px; padding:1.5rem; border-radius:var(--medium-radius);">
              <div style="text-align:center; margin-bottom:1rem; line-height:1;">
                <h3 style="font-size:1.3rem; font-weight:700; margin:0; line-height:1.1; color:var(--text-color);">${marca}</h3>
                <p style="font-size:0.95rem; font-weight:400; margin:0; line-height:1.2; color:var(--text-muted-color);">${modelo}</p>
              </div>
              <figure class="card__media">
                <img src="${img}" alt="${marca} ${modelo}" loading="lazy" width="200" height="200" decoding="async">
              </figure>
              <p>${categoria}</p>
              <div class="card__price">${priceText}</div>
            </div>
          </a>
        `;
      }).join('');

      if (cardsHTML) {
        container.innerHTML = `
          <h2 style="flex-basis:100%; margin:0 0 1rem 0;">Nuestros Equipos</h2>
          ${cardsHTML}
          <div style="flex-basis:100%; text-align:center;">
            <a href="Tienda.html"
               style="display:inline-block; padding:0.75rem 1.5rem; color:var(--text-color); text-decoration:none; font-weight:500; border-radius:8px; transition:background 0.3s ease;"
               onmouseenter="this.style.background='rgba(255, 255, 255, 0.1)'"
               onmouseleave="this.style.background='transparent'">
              Ver más
            </a>
          </div>
        `;
      } else {
        container.innerHTML = `
          <h2 style="flex-basis:100%; margin:0 0 1rem 0;">Nuestros Equipos</h2>
          <div class="glass-effect" style="padding:1rem;">No hay productos disponibles.</div>
        `;
      }

      // iPhone (Apple) únicamente - generar HTML en lote
      const appleProducts = products.filter((p) => (p.Marca || p.marca || "").toLowerCase() === "apple");
      const appleCardsHTML = appleProducts.slice(0, 3).map((p) => {
        const basePrice =
          p.variantes && p.variantes.length
            ? Math.min(...p.variantes.map((v) => v.precio))
            : null;
        const priceText = basePrice != null ? `$${basePrice}` : "";
        const imgBase64 = p.img || p.Img;
        const img = imgBase64
          ? `data:image/webp;base64,${imgBase64}`
          : "/img/LOGO+CIRCULO.webp";
        const productId = p.id ?? p.Id;
        const marca = p.Marca || p.marca || "Marca";
        const modelo = p.Modelo || p.modelo || "Modelo";
        const categoria = p.Categoria || p.categoria || "";

        return `
          <a href="DetalleProducto.html?id=${productId}" style="text-decoration:none; color:inherit;">
            <div class="glass-effect card" style="flex:0 0 260px; min-height:200px; padding:1.5rem; border-radius:var(--medium-radius);">
              <div style="text-align:center; margin-bottom:1rem; line-height:1;">
                <h3 style="font-size:1.3rem; font-weight:700; margin:0; line-height:1.1; color:var(--text-color);">${marca}</h3>
                <p style="font-size:0.95rem; font-weight:400; margin:0; line-height:1.2; color:var(--text-muted-color);">${modelo}</p>
              </div>
              <figure class="card__media">
                <img src="${img}" alt="${marca} ${modelo}" loading="lazy" width="200" height="200" decoding="async">
              </figure>
              <p>${categoria}</p>
              <div class="card__price">${priceText}</div>
            </div>
          </a>
        `;
      }).join('');

      if (appleCardsHTML) {
        iphoneContainer.innerHTML = `
          <h2 style="flex-basis:100%; margin:0 0 1rem 0;">Últimos iPhone</h2>
          ${appleCardsHTML}
          <div style="flex-basis:100%; text-align:center;">
            <a href="Tienda.html"
               style="display:inline-block; padding:0.75rem 1.5rem; color:var(--text-color); text-decoration:none; font-weight:500; border-radius:8px; transition:background 0.3s ease;"
               onmouseenter="this.style.background='rgba(255, 255, 255, 0.1)'"
               onmouseleave="this.style.background='transparent'">
              Ver más
            </a>
          </div>
        `;
      } else {
        iphoneContainer.innerHTML = `
          <h2 style="flex-basis:100%; margin:0 0 1rem 0;">Últimos iPhone</h2>
          <div class="glass-effect" style="padding:1rem;">No hay productos Apple disponibles.</div>
        `;
      }
    } catch (e) {
      console.error("Error cargando productos del backend:", e);

      // Mostrar mensaje de error amigable
      const errorHTML = `
        <h2 style="flex-basis:100%; margin:0 0 1rem 0;">Nuestros Equipos</h2>
        <div class="error-message glass-effect" style="flex-basis:100%;">
          <div class="error-message__title">No pudimos cargar los productos</div>
          <div class="error-message__text">
            Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.
          </div>
          <button class="retry-button" onclick="location.reload()">
            Reintentar
          </button>
        </div>
      `;

      const errorHTMLiPhone = `
        <h2 style="flex-basis:100%; margin:0 0 1rem 0;">Últimos iPhone</h2>
        <div class="error-message glass-effect" style="flex-basis:100%;">
          <div class="error-message__title">No pudimos cargar los productos</div>
          <div class="error-message__text">
            Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.
          </div>
          <button class="retry-button" onclick="location.reload()">
            Reintentar
          </button>
        </div>
      `;

      container.innerHTML = errorHTML;
      iphoneContainer.innerHTML = errorHTMLiPhone;
    }
  })();
});
