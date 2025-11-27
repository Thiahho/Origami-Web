// Tienda filters and pagination
// Carga Navbar y Footer
fetch("Navbar/navbar.html")
  .then((r) => r.text())
  .then((h) => {
    document.getElementById("navbar-placeholder").innerHTML = h;
    // Ejecutar la función de autenticación después de cargar el navbar
    setTimeout(async () => {
      if (typeof initNavbarAuth === "function") {
        await initNavbarAuth();
      } else {
        console.error("initNavbarAuth no está disponible");
      }
    }, 100);
  });

fetch("Footer/footer.html")
  .then((r) => r.text())
  .then((h) => {
    document.getElementById("footer-placeholder").innerHTML = h;
  });

// -------- refs ----------
const q = document.getElementById("fSearch");
const grid = document.getElementById("grid");
const pager = document.getElementById("pager");
let all = [];
let sections = new Map(); // categoria => { sectionEl, titleEl, gridEl }
const DEFAULT_LIMIT = 6; // máximo por categoría sin filtro
const LIMIT_STEP = 6; // incremento por click
let limitsByCategory = new Map(); // categoria(label) -> limite visible

// -------- estado ----------
let page = 1;
const pageSize = 9; // 4x3  (usa 9 para 3x3)
let qVal = "";
let capVal = "";
let brandVal = "";
let activeType = ""; // '', 'celulares', 'accesorios', 'notebooks', 'productos'

// -------- dropdown glass ----------
function wireDropdown(id, onSelect) {
  const dd = document.getElementById(id);
  const btn = dd.querySelector(".dropdown-btn");
  const list = dd.querySelector(".dropdown-list");
  btn.addEventListener("click", () => dd.classList.toggle("open"));
  list.addEventListener("click", (e) => {
    const it = e.target.closest(".dropdown-item");
    if (!it) return;
    btn.innerHTML = `${it.textContent} <span>▾</span>`;
    dd.classList.remove("open");
    onSelect(it.dataset.val || "");
    page = 1;
    render();
  });
  document.addEventListener("click", (e) => {
    if (!dd.contains(e.target)) dd.classList.remove("open");
  });
}
wireDropdown("capDD", (v) => (capVal = v));
wireDropdown("brandDD", (v) => (brandVal = v));

// -------- texto ----------
q?.addEventListener("input", () => {
  qVal = q.value.trim().toLowerCase();
  page = 1;
  render();
});

// -------- filtros ----------
function applyFilters() {
  return all.filter((el) => {
    const model = (el.dataset.model || "").toLowerCase();
    const caps = (el.dataset.capacity || "").split(",");
    const brand = (el.dataset.cat || "").toLowerCase();
    const type = el.dataset.type || "";

    const okText = !qVal || model.includes(qVal);
    const okCap = !capVal || caps.includes(capVal);
    const okBrand = !brandVal || brand === brandVal;
    const okType = !activeType || type === activeType;

    return okText && okCap && okBrand && okType;
  });
}

// -------- render + paginación ----------
function render() {
  const items = applyFilters();

  // Deshabilitar paginación en modo secciones
  pager.innerHTML = "";
  pager.style.display = "none";
  grid.style.marginTop = "0";

  // Ocultar todo inicialmente
  all.forEach((el) => {
    el.style.display = "none";
  });

  // Agrupar visibles por categoría
  const byCat = new Map();
  items.forEach((el) => {
    const cat = el.dataset.type || "otros";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(el);
  });

  // Si hay categoría activa => mostrar todos los de esa categoría (y filtros)
  // Si NO hay categoría activa => mostrar hasta 6 por categoría
  let anyNeedsMore = false;
  if (activeType) {
    items.forEach((el) => {
      el.style.display = "";
    });
  } else {
    byCat.forEach((arr, key) => {
      // buscar label de sección equivalente (key viene en minúsculas)
      const sectionLabel =
        Array.from(sections.keys()).find(
          (lbl) => (lbl || "otros").toString().toLowerCase() === key
        ) || key;
      const currentLimit = limitsByCategory.get(sectionLabel) ?? DEFAULT_LIMIT;
      if (arr.length > currentLimit) anyNeedsMore = true;
      arr.slice(0, currentLimit).forEach((el) => {
        el.style.display = "";
      });
    });
  }

  // Mostrar/Ocultar secciones según si tienen visibles y forzar límite visual por sección
  sections.forEach(({ sectionEl, gridEl }, label) => {
    const children = Array.from(gridEl.children);
    let shown = 0;
    children.forEach((ch) => {
      const isVisible = ch.style.display !== "none";
      if (!activeType) {
        if (isVisible) {
          shown++;
          const currentLimit = limitsByCategory.get(label) ?? DEFAULT_LIMIT;
          if (shown > currentLimit) ch.style.display = "none";
        }
      }
    });
    const hasVisible = children.some((ch) => ch.style.display !== "none");
    sectionEl.style.display = hasVisible ? "" : "none";

    // Ver más por sección (solo sin filtro de categoría)
    let moreWrap = sectionEl.querySelector(".category-more");
    if (activeType) {
      if (moreWrap) moreWrap.remove();
    } else {
      const key = (label || "otros").toString().toLowerCase();
      const totalInCat = byCat.get(key)?.length || 0;
      const currentLimit = limitsByCategory.get(label) ?? DEFAULT_LIMIT;
      const needsMore = totalInCat > currentLimit;
      if (needsMore) {
        if (!moreWrap) {
          moreWrap = document.createElement("div");
          moreWrap.className = "category-more";
          moreWrap.style.textAlign = "center";
          const btn = document.createElement("button");
          btn.className = "category-more-btn glass-effect";
          btn.style.margin = "0 auto";
          btn.textContent = "Ver más";
          btn.onclick = () => {
            const next =
              (limitsByCategory.get(label) ?? DEFAULT_LIMIT) + LIMIT_STEP;
            limitsByCategory.set(label, next);
            render();
          };
          moreWrap.appendChild(btn);
          sectionEl.appendChild(moreWrap);
        } else {
          const btn = moreWrap.querySelector("button");
          if (btn)
            btn.onclick = () => {
              const next =
                (limitsByCategory.get(label) ?? DEFAULT_LIMIT) + LIMIT_STEP;
              limitsByCategory.set(label, next);
              render();
            };
        }
      } else if (moreWrap) {
        moreWrap.remove();
      }
    }
  });
  // Ocultar paginador global
  pager.innerHTML = "";
  pager.style.display = "none";
}

function populateDynamicFilters(products) {
  // Extraer capacidades únicas
  const capacities = new Set();
  products.forEach((p) => {
    if (p.variantes && p.variantes.length) {
      p.variantes.forEach((v) => {
        if (v.almacenamiento || v.Almacenamiento) {
          capacities.add(v.almacenamiento || v.Almacenamiento);
        }
      });
    }
  });

  // Llenar dropdown de capacidades
  const capList = document.querySelector("#capDD .dropdown-list");
  capList.innerHTML = '<div class="dropdown-item" data-val="">Todas</div>';
  Array.from(capacities)
    .sort()
    .forEach((cap) => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.dataset.val = cap;
      item.textContent = cap;
      capList.appendChild(item);
    });

  // Extraer marcas únicas
  const brands = new Set();
  products.forEach((p) => {
    const marca = (p.Marca || p.marca || "").trim();
    if (marca) brands.add(marca);
  });

  // Llenar dropdown de marcas
  const brandList = document.querySelector("#brandDD .dropdown-list");
  brandList.innerHTML = '<div class="dropdown-item" data-val="">Todas</div>';
  Array.from(brands)
    .sort()
    .forEach((brand) => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.dataset.val = brand.toLowerCase();
      item.textContent = brand;
      brandList.appendChild(item);
    });

  // Extraer categorías únicas
  const categories = new Set();
  products.forEach((p) => {
    const cat = (p.Categoria || p.categoria || "").trim();
    if (cat) categories.add(cat);
  });

  // Llenar chips de categorías
  const quickcats = document.querySelector(".quickcats");
  quickcats.innerHTML =
    '<button class="chip is-active" data-type="">Todos</button>';
  Array.from(categories)
    .sort()
    .forEach((cat) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.dataset.type = cat.toLowerCase();
      chip.textContent = cat;
      chip.addEventListener("click", () => {
        document
          .querySelectorAll(".quickcats .chip")
          .forEach((x) => x.classList.remove("is-active"));
        chip.classList.add("is-active");
        activeType = chip.dataset.type || "";
        page = 1;
        render();
      });
      quickcats.appendChild(chip);
    });

  // Reagregar listener al botón "Todos"
  quickcats
    .querySelector('[data-type=""]')
    .addEventListener("click", function () {
      document
        .querySelectorAll(".quickcats .chip")
        .forEach((x) => x.classList.remove("is-active"));
      this.classList.add("is-active");
      activeType = "";
      page = 1;
      render();
    });
}

async function loadProductsFromApi() {
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
    // Paginado inicial: 1ra página grande para no romper filtros locales; si falla, fallback al endpoint antiguo
    let products = [];
    try {
      const res = await axios.get("/api/Producto/paged", {
        params: { page: 1, pageSize: 100 },
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

    // Poblar filtros dinámicos
    populateDynamicFilters(products);

    // Preparar estilos para secciones (una vez)
    if (!document.getElementById("store-section-styles")) {
      const styles = document.createElement("style");
      styles.id = "store-section-styles";
      styles.textContent = `
        .category-section { margin: 1.5rem 0 2rem; }
        .category-title { margin: 0 0 0.75rem; font-size: 1.4rem; font-weight: 700; color: var(--text-color); }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
      `;
      document.head.appendChild(styles);
    }

    // Limpiar y crear secciones por categoría
    grid.innerHTML = "";
    grid.classList.add("use-sections");
    // Forzar layout de secciones por si el CSS en caché mantiene la grilla
    grid.style.display = "block";
    sections.clear();
    all = [];

    const getSection = (catLabel) => {
      const label = (catLabel || "Otros").toString();
      if (sections.has(label)) return sections.get(label);
      const sectionEl = document.createElement("section");
      sectionEl.className = "category-section";
      const titleEl = document.createElement("h2");
      titleEl.className = "category-title";
      titleEl.textContent = label;
      const gridEl = document.createElement("div");
      gridEl.className = "category-grid";
      sectionEl.appendChild(titleEl);
      sectionEl.appendChild(gridEl);
      grid.appendChild(sectionEl);
      const pack = { sectionEl, titleEl, gridEl };
      sections.set(label, pack);
      return pack;
    };

    // Orden estable por categoría (alfabético) para consistencia
    products
      .sort((a, b) => {
        const ca = (a.Categoria || a.categoria || "Otros")
          .toString()
          .toLowerCase();
        const cb = (b.Categoria || b.categoria || "Otros")
          .toString()
          .toLowerCase();
        return ca.localeCompare(cb);
      })
      .forEach((p) => {
        const basePrice =
          p.variantes && p.variantes.length
            ? Math.min(...p.variantes.map((v) => v.precio))
            : null;
        const priceText = basePrice != null ? `$${basePrice}` : "";
        const imgBase64 = p.img || p.Img;
        const img = imgBase64
          ? `data:image/webp;base64,${imgBase64}`
          : "img/CanvaLogoWeb.webp";
        const catLabel = (p.Categoria || p.categoria || "Otros").toString();

        const article = document.createElement("article");
        article.className = "card glass-effect";
        article.dataset.model = `${p.Marca || p.marca || ""} ${
          p.Modelo || p.modelo || ""
        }`.trim();
        const caps =
          p.variantes && p.variantes.length
            ? p.variantes
                .map((v) => v.almacenamiento || v.Almacenamiento)
                .filter(Boolean)
                .join(",")
            : "";
        article.dataset.capacity = caps;
        article.dataset.cat = (p.Marca || p.marca || "").toLowerCase();
        article.dataset.type = (catLabel || "").toLowerCase();
        const productId = p.id ?? p.Id;
        article.onclick = () => {
          window.location.href = `DetalleProducto.html?id=${productId}`;
        };

        // Contenedor para marca y modelo
        const titleContainer = document.createElement("div");
        titleContainer.className = "card__title-container";
        titleContainer.style.textAlign = "center";
        titleContainer.style.marginBottom = "1rem";
        titleContainer.style.lineHeight = "1";

        // Marca - más grande y gruesa
        const marca = document.createElement("h3");
        marca.className = "card__brand";
        marca.textContent = p.Marca || p.marca || "Marca";
        marca.style.fontSize = "1.3rem";
        marca.style.fontWeight = "700";
        marca.style.margin = "0";
        marca.style.lineHeight = "1.1";
        marca.style.color = "var(--text-color)";

        // Modelo - más pequeño y fino
        const modelo = document.createElement("p");
        modelo.className = "card__model";
        modelo.textContent = p.Modelo || p.modelo || "Modelo";
        modelo.style.fontSize = "1rem";
        modelo.style.fontWeight = "600";
        modelo.style.margin = "0";
        modelo.style.lineHeight = "1.2";
        modelo.style.color = "var(--text-muted-color)";

        titleContainer.appendChild(marca);
        titleContainer.appendChild(modelo);

        const fig = document.createElement("figure");
        fig.className = "card__media";
        const image = document.createElement("img");
        image.src = img;
        image.alt = "";
        fig.appendChild(image);

        const pDesc = document.createElement("p");
        pDesc.className = "card__desc";
        pDesc.textContent = catLabel;

        const price = document.createElement("div");
        price.className = "card__price";
        price.textContent = priceText;

        article.appendChild(titleContainer);
        article.appendChild(fig);
        article.appendChild(pDesc);
        article.appendChild(price);

        const { gridEl } = getSection(catLabel);
        gridEl.appendChild(article);
        all.push(article);
      });

    render();
  } catch (e) {
    console.error("Error cargando productos de la API:", e);
  }
}

loadProductsFromApi();
