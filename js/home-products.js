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

  const apiTimeoutMs = () => window.frontendConfig?.apiTimeout ?? 30000;
  const shouldLog = () => !!window.frontendConfig?.enableLogging;

  const renderStatus = (
    section,
    titleText,
    message,
    { showRetry = false, onRetry } = {}
  ) => {
    section.innerHTML = "";

    const title = document.createElement("h2");
    title.style.flexBasis = "100%";
    title.style.margin = "0 0 1rem 0";
    title.textContent = titleText;

    const status = document.createElement("div");
    status.className = "api-status glass-effect";
    status.style.padding = "1rem";
    status.style.textAlign = "center";
    status.textContent = message;

    section.appendChild(title);
    section.appendChild(status);

    if (showRetry && typeof onRetry === "function") {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "detalle-btn primary";
      retry.style.marginTop = "0.75rem";
      retry.textContent = "Reintentar";
      retry.addEventListener("click", onRetry);
      section.appendChild(retry);
    }
  };

  const axiosGetWithTimeout = async (url, config = {}, label = "") => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiTimeoutMs());
    const start = performance.now();
    try {
      return await axios.get(url, { ...config, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
      if (shouldLog()) {
        const duration = Math.round(performance.now() - start);
        const tag = label || url;
        console.log(`[Home] ${tag} en ${duration}ms`);
      }
    }
  };

  const renderSection = (section, titleText, products, emptyText) => {
    section.innerHTML = "";

    const title = document.createElement("h2");
    title.style.flexBasis = "100%";
    title.style.margin = "0 0 1rem 0";
    title.textContent = titleText;
    section.appendChild(title);

    if (!products.length) {
      const empty = document.createElement("div");
      empty.className = "glass-effect";
      empty.style.padding = "1rem";
      empty.textContent = emptyText;
      section.appendChild(empty);
      return;
    }

    products.forEach((card) => section.appendChild(card));

    const verMasWrapper = document.createElement("div");
    verMasWrapper.style.cssText = "flex-basis:100%; text-align:center;";

    const verMasBtn = document.createElement("a");
    verMasBtn.href = "Tienda.html";
    verMasBtn.textContent = "Ver más";
    verMasBtn.style.cssText =
      "display:inline-block; padding:0.75rem 1.5rem; color:var(--text-color); text-decoration:none; font-weight:500; border-radius:8px; transition:background 0.3s ease;";
    verMasBtn.addEventListener("mouseenter", () => {
      verMasBtn.style.background = "rgba(255, 255, 255, 0.1)";
    });
    verMasBtn.addEventListener("mouseleave", () => {
      verMasBtn.style.background = "transparent";
    });

    verMasWrapper.appendChild(verMasBtn);
    section.appendChild(verMasWrapper);
  };

  const createCard = (p) => {
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

    const a = document.createElement("a");
    a.href = `DetalleProducto.html?id=${productId}`;
    a.style.textDecoration = "none";
    a.style.color = "inherit";

    const card = document.createElement("div");
    card.className = "glass-effect card";
    card.style.flex = "0 0 260px";
    card.style.minHeight = "200px";
    card.style.padding = "1.5rem";
    card.style.borderRadius = "var(--medium-radius)";

    const titleContainer = document.createElement("div");
    titleContainer.style.textAlign = "center";
    titleContainer.style.marginBottom = "1rem";
    titleContainer.style.lineHeight = "1";

    const marca = document.createElement("h3");
    marca.textContent = p.Marca || p.marca || "Marca";
    marca.style.fontSize = "1.3rem";
    marca.style.fontWeight = "700";
    marca.style.margin = "0";
    marca.style.lineHeight = "1.1";
    marca.style.color = "var(--text-color)";

    const modelo = document.createElement("p");
    modelo.textContent = p.Modelo || p.modelo || "Modelo";
    modelo.style.fontSize = "0.95rem";
    modelo.style.fontWeight = "400";
    modelo.style.margin = "0";
    modelo.style.lineHeight = "1.2";
    modelo.style.color = "var(--text-muted-color)";

    titleContainer.appendChild(marca);
    titleContainer.appendChild(modelo);

    const fig = document.createElement("figure");
    fig.className = "card__media";
    const image = document.createElement("img");
    image.src = img;
    image.alt = "Producto";
    image.loading = "lazy";
    fig.appendChild(image);

    const pDesc = document.createElement("p");
    pDesc.textContent = p.Categoria || p.categoria || "";

    const price = document.createElement("div");
    price.className = "card__price";
    price.textContent = priceText;

    card.appendChild(titleContainer);
    card.appendChild(fig);
    card.appendChild(pDesc);
    card.appendChild(price);
    a.appendChild(card);
    return a;
  };

  const loadHomeProducts = async () => {
    const container = document.getElementById("home-products");
    const iphoneContainer = document.getElementById("home-iphone");

    renderStatus(container, "Nuestros Equipos", "Cargando...");
    renderStatus(iphoneContainer, "Últimos iPhone", "Cargando...");

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
        const apiUrl = window.frontendConfig
          ? window.frontendConfig.getApiUrl("/api/Producto/paged")
          : "/api/Producto/paged";
        const res = await axiosGetWithTimeout(
          apiUrl,
          {
            params: { page: 1, pageSize: 30 },
          },
          "/api/Producto/paged"
        );
        const data = res.data || {};
        products = Array.isArray(data.items)
          ? data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
      } catch (e) {
        console.warn("Paged endpoint falló, usando /api/Producto clásico:", e);
        const fallbackUrl = window.frontendConfig
          ? window.frontendConfig.getApiUrl("/api/Producto")
          : "/api/Producto";
        const fallback = await axiosGetWithTimeout(
          fallbackUrl,
          {},
          "/api/Producto"
        );
        products = Array.isArray(fallback.data)
          ? fallback.data
          : fallback.data?.items || [];
      }

      const cards = products.slice(0, 3).map((p) => createCard(p));

      renderSection(
        container,
        "Nuestros Equipos",
        cards,
        "No hay productos disponibles."
      );

      const appleCards = products
        .filter((p) => (p.Marca || p.marca || "").toLowerCase() === "apple")
        .slice(0, 3)
        .map((p) => createCard(p));

      renderSection(
        iphoneContainer,
        "Últimos iPhone",
        appleCards,
        "No hay productos Apple disponibles."
      );
    } catch (e) {
      console.error("Error cargando productos del backend:", e);
      renderStatus(
        container,
        "Nuestros Equipos",
        "Ocurrió un error al cargar los productos. Reintentar",
        { showRetry: true, onRetry: loadHomeProducts }
      );
      renderStatus(
        iphoneContainer,
        "Últimos iPhone",
        "Ocurrió un error al cargar los productos. Reintentar",
        { showRetry: true, onRetry: loadHomeProducts }
      );
    }
  };

  loadHomeProducts();
});
