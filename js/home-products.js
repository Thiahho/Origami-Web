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

  const backgroundImages = ["img/PLANTILLA 1.webp"];

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
        const res = await axios.get("/api/Producto/paged", {
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
        const fallback = await axios.get("/api/Producto");
        products = Array.isArray(fallback.data)
          ? fallback.data
          : fallback.data?.items || [];
      }
      const container = document.getElementById("home-products");
      const iphoneContainer = document.getElementById("home-iphone");
      container.innerHTML =
        '<h2 style="flex-basis:100%; margin:0 0 1rem 0;">Nuestros Equipos</h2>';
      iphoneContainer.innerHTML =
        '<h2 style="flex-basis:100%; margin:0 0 1rem 0;">Últimos iPhone</h2>';

      const cards = products.slice(0, 3).map((p) => {
        const basePrice =
          p.variantes && p.variantes.length
            ? Math.min(...p.variantes.map((v) => v.precio))
            : null;
        const priceText = basePrice != null ? `$${basePrice}` : "";
        const imgBase64 = p.img || p.Img;
        const img = imgBase64
          ? `data:image/webp;base64,${imgBase64}`
          : "img/CanvaLogoWeb.webp";
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

        // Contenedor para marca y modelo
        const titleContainer = document.createElement("div");
        titleContainer.style.textAlign = "center";
        titleContainer.style.marginBottom = "1rem";
        titleContainer.style.lineHeight = "1";

        // Marca - más grande y gruesa
        const marca = document.createElement("h3");
        marca.textContent = p.Marca || p.marca || "Marca";
        marca.style.fontSize = "1.3rem";
        marca.style.fontWeight = "700";
        marca.style.margin = "0";
        marca.style.lineHeight = "1.1";
        marca.style.color = "var(--text-color)";

        // Modelo - más pequeño y fino
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
      });

      if (cards.length === 0) {
        const empty = document.createElement("div");
        empty.className = "glass-effect";
        empty.style.padding = "1rem";
        empty.textContent = "No hay productos disponibles.";
        container.appendChild(empty);
      } else {
        cards.forEach((c) => container.appendChild(c));

        // Botón "Ver más"
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
        container.appendChild(verMasWrapper);
      }

      // iPhone (Apple) únicamente
      const appleCards = products
        .filter((p) => (p.Marca || p.marca || "").toLowerCase() === "apple")
        .slice(0, 3)
        .map((p) => {
          const basePrice =
            p.variantes && p.variantes.length
              ? Math.min(...p.variantes.map((v) => v.precio))
              : null;
          const priceText = basePrice != null ? `$${basePrice}` : "";
          const imgBase64 = p.img || p.Img;
          const img = imgBase64
            ? `data:image/webp;base64,${imgBase64}`
            : "img/CanvaLogoWeb.webp";
          const productId = p.id ?? p.Id;

          const a = document.createElement("a");
          a.href = `DetalleProducto.html?id=${productId}`;
          a.style.textDecoding = "none";
          a.style.color = "inherit";

          const card = document.createElement("div");
          card.className = "glass-effect card";
          card.style.flex = "0 0 260px";
          card.style.minHeight = "200px";
          card.style.padding = "1.5rem";
          card.style.borderRadius = "var(--medium-radius)";

          // Contenedor para marca y modelo
          const titleContainer = document.createElement("div");
          titleContainer.style.textAlign = "center";
          titleContainer.style.marginBottom = "1rem";
          titleContainer.style.lineHeight = "1";

          // Marca - más grande y gruesa
          const marca = document.createElement("h3");
          marca.textContent = p.Marca || p.marca || "Marca";
          marca.style.fontSize = "1.3rem";
          marca.style.fontWeight = "700";
          marca.style.margin = "0";
          marca.style.lineHeight = "1.1";
          marca.style.color = "var(--text-color)";

          // Modelo - más pequeño y fino
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
        });
      if (appleCards.length === 0) {
        const empty = document.createElement("div");
        empty.className = "glass-effect";
        empty.style.padding = "1rem";
        empty.textContent = "No hay productos Apple disponibles.";
        iphoneContainer.appendChild(empty);
      } else {
        appleCards.forEach((c) => iphoneContainer.appendChild(c));

        // Botón "Ver más"
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
        iphoneContainer.appendChild(verMasWrapper);
      }
    } catch (e) {
      console.error("Error cargando productos del backend:", e);
    }
  })();
});
