// Renderiza las secciones del home según window.homeSectionsConfig
document.addEventListener("DOMContentLoaded", () => {
  // fondo manejado 100% por CSS (Home.css)

  (async function loadHomeProducts() {
    const root = document.getElementById("home-root");
    const sections = window.homeSectionsConfig || [];

    // Montar skeletons por cada sección configurada
    root.innerHTML = sections
      .map(
        (sec) => `
      <section id="${sec.id}" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;justify-content:center;overflow-x:visible;">
        <h2 style="flex-basis:100%;margin:0 0 1rem 0">${sec.title}</h2>
        ${Array.from({ length: sec.limit })
          .map(
            () => `
          <div class="skeleton-card glass-effect" style="flex:0 0 260px;min-height:200px;padding:1.5rem;border-radius:var(--medium-radius);">
            <div style="height:1.3rem;width:60%;margin:0 auto 0.5rem;background:rgba(255,255,255,0.1);border-radius:4px;animation:pulse 1.5s ease-in-out infinite;"></div>
            <div style="height:0.95rem;width:80%;margin:0 auto 1rem;background:rgba(255,255,255,0.08);border-radius:4px;animation:pulse 1.5s ease-in-out infinite;"></div>
            <div style="height:200px;width:100%;margin:0 auto 1rem;background:rgba(255,255,255,0.1);border-radius:8px;animation:pulse 1.5s ease-in-out infinite;"></div>
            <div style="height:1rem;width:40%;margin:0 auto 0.5rem;background:rgba(255,255,255,0.08);border-radius:4px;animation:pulse 1.5s ease-in-out infinite;"></div>
            <div style="height:1.5rem;width:30%;margin:0 auto;background:rgba(255,255,255,0.1);border-radius:4px;animation:pulse 1.5s ease-in-out infinite;"></div>
          </div>`
          )
          .join("")}
      </section>`
      )
      .join("");

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
        const res = await axios.get(apiUrl, { params: { page: 1, pageSize: 30 } });
        const data = res.data || {};
        products = Array.isArray(data.items)
          ? data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
      } catch {
        const fallbackUrl = window.frontendConfig
          ? window.frontendConfig.getApiUrl("/api/Producto")
          : "/api/Producto";
        const fallback = await axios.get(fallbackUrl);
        products = Array.isArray(fallback.data)
          ? fallback.data
          : fallback.data?.items || [];
      }

      // Renderizar cada sección según su config
      for (const sec of sections) {
        const container = document.getElementById(sec.id);
        if (!container) continue;

        const filtered = products.filter(sec.filter).slice(0, sec.limit);

        if (!filtered.length) {
          container.innerHTML = `
            <h2 style="flex-basis:100%;margin:0 0 1rem 0">${sec.title}</h2>
            <div class="glass-effect" style="padding:1rem;">No hay productos disponibles.</div>`;
          continue;
        }

        const cardsHTML = filtered
          .map((p) => {
            const basePrice =
              p.variantes?.length
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
              <a href="DetalleProducto.html?id=${productId}" style="text-decoration:none;color:inherit;">
                <div class="glass-effect card" style="flex:0 0 260px;min-height:200px;padding:1.5rem;border-radius:var(--medium-radius);">
                  <div style="text-align:center;margin-bottom:1rem;line-height:1;">
                    <h3 style="font-size:1.3rem;font-weight:700;margin:0;line-height:1.1;color:var(--text-color);">${marca}</h3>
                    <p style="font-size:0.95rem;font-weight:400;margin:0;line-height:1.2;color:var(--text-muted-color);">${modelo}</p>
                  </div>
                  <figure class="card__media">
                    <img src="${img}" alt="${marca} ${modelo}" loading="lazy" width="200" height="200" decoding="async">
                  </figure>
                  <p>${categoria}</p>
                  <div class="card__price">${priceText}</div>
                </div>
              </a>`;
          })
          .join("");

        container.innerHTML = `
          <h2 style="flex-basis:100%;margin:0 0 1rem 0">${sec.title}</h2>
          ${cardsHTML}
          <div style="flex-basis:100%;text-align:center;">
            <a href="Tienda.html"
               style="display:inline-block;padding:0.75rem 1.5rem;color:var(--text-color);text-decoration:none;font-weight:500;border-radius:8px;transition:background 0.3s ease;"
               onmouseenter="this.style.background='rgba(255,255,255,0.1)'"
               onmouseleave="this.style.background='transparent'">
              Ver más
            </a>
          </div>`;
      }
    } catch (e) {
      console.error("Error cargando productos del backend:", e);
      root.innerHTML = `
        <div class="error-message glass-effect" style="margin:1rem;padding:1.5rem;">
          <div class="error-message__title">No pudimos cargar los productos</div>
          <div class="error-message__text">Hubo un problema al conectar con el servidor. Por favor, intenta nuevamente.</div>
          <button class="retry-button" onclick="location.reload()">Reintentar</button>
        </div>`;
    }
  })();
});
