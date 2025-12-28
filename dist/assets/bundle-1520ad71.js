// ==================== CONFIGURACIÓN GLOBAL - FRONTEND PÚBLICO ====================
class FrontendConfig {
constructor() {
this.environment = this.detectEnvironment();
this.config = this.getConfig();
}
detectEnvironment() {
// Detección automática de ambiente
const hostname = window.location.hostname;
if (hostname === "localhost" || hostname === "127.0.0.1") {
return "development";
}
return "production";
}
getConfig() {
const configs = {
development: {
// En desarrollo, el backend sirve el frontend
// Las rutas relativas /api/ funcionan directamente
apiUrl: "", // Vacío para usar rutas relativas (localhost)
apiTimeout: 30000,
enableLogging: true,
},
production: {
// En producción, necesitamos la URL completa del backend
apiUrl: "https://origamiimportados.com",
apiTimeout: 30000,
enableLogging: false,
},
};
return configs[this.environment];
}
get apiUrl() {
return this.config.apiUrl;
}
get apiTimeout() {
return this.config.apiTimeout;
}
get enableLogging() {
return this.config.enableLogging;
}
// Helper para construir URL completa de API
getApiUrl(endpoint) {
// Si apiUrl está vacío, usar ruta relativa (desarrollo)
if (!this.config.apiUrl) {
return endpoint;
}
// En producción, concatenar URL base
return this.config.apiUrl + endpoint;
}
log(...args) {
if (this.enableLogging) {
//console.log("[Frontend]", ...args);
}
}
error(...args) {
if (this.enableLogging) {
console.error("[Frontend ERROR]", ...args);
}
}
}
// Exportar instancia global
window.frontendConfig = new FrontendConfig();
// Alias retrocompatible
if (!window.apiConfig) {
window.apiConfig = window.frontendConfig;
}
;// ==================== NAVBAR AUTHENTICATION ====================
// Función global para manejar la autenticación del navbar
async function initNavbarAuth() {
//////console.log("initNavbarAuth ejecutándose...");
const authButton = document.getElementById("authButton");
if (!authButton) {
//////console.log('Botón de autenticación no encontrado, reintentando en 200ms...');
// Reintentar después de un breve delay
setTimeout(initNavbarAuth, 200);
return;
}
//////console.log('Botón de autenticación encontrado:', authButton);
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
const apiBase = window.apiConfig.apiUrl;
const res = await axios.get(`${apiBase}/api/Admin/verify`, {
withCredentials: true,
});
if (res?.data?.isAuthenticated) {
// Usuario logueado - cambiar a "Volver al Panel"
authButton.href = "admin/dashboard.html";
authButton.setAttribute("aria-label", "Volver al Panel");
const labelElement = authButton.querySelector(".btn-login__label");
const iconElement = authButton.querySelector("i");
if (labelElement) {
labelElement.textContent = "Volver al Panel";
}
if (iconElement) {
iconElement.className = "fa-solid fa-cog";
}
////console.log('Botón actualizado a "Volver al Panel"');
} else {
////console.log('Usuario no autenticado - mostrando "Iniciar sesión"');
}
} catch (error) {
////console.log("Error verificando autenticación:", error.message);
////console.log('Mostrando "Iniciar sesión" por defecto');
}
}
// Función para verificar si el usuario está autenticado
async function isUserAuthenticated() {
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
const apiBase = window.apiConfig.apiUrl;
const res = await axios.get(`${apiBase}/api/Admin/verify`, {
withCredentials: true,
});
return res?.data?.isAuthenticated || false;
} catch (error) {
////console.log("Error verificando autenticación:", error.message);
return false;
}
}
// Función para actualizar el navbar cuando cambie el estado de autenticación
async function updateNavbarAuth() {
await initNavbarAuth();
}
// Escuchar cambios en el localStorage para actualizar el navbar automáticamente
window.addEventListener("storage", function (e) {
if (
e.key === "token" ||
e.key === "authToken" ||
e.key === "jwt" ||
e.key === "accessToken"
) {
updateNavbarAuth();
}
});
// Función para ejecutar automáticamente cuando el DOM esté listo
function autoInitNavbarAuth() {
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", initNavbarAuth);
} else {
initNavbarAuth();
}
}
// NO ejecutar automáticamente - solo cuando se llame explícitamente
// autoInitNavbarAuth();
// Observer para detectar cuando se agrega el navbar al DOM
function setupNavbarObserver() {
const targetNode = document.body;
const config = { childList: true, subtree: true };
const callback = function (mutationsList, observer) {
for (let mutation of mutationsList) {
if (mutation.type === "childList") {
for (let node of mutation.addedNodes) {
if (node.nodeType === Node.ELEMENT_NODE) {
// Verificar si se agregó el navbar
if (
node.id === "navbar-placeholder" ||
(node.querySelector && node.querySelector("#authButton"))
) {
////console.log("Navbar detectado, ejecutando initNavbarAuth...");
setTimeout(() => initNavbarAuth(), 100);
}
// También verificar si el contenido del navbar-placeholder cambió
if (
node.id === "navbar-placeholder" &&
node.innerHTML.includes("authButton")
) {
////console.log(
("Contenido del navbar detectado, ejecutando initNavbarAuth...");
//  );
setTimeout(() => initNavbarAuth(), 100);
}
}
}
}
}
};
const observer = new MutationObserver(callback);
observer.observe(targetNode, config);
return observer;
}
// Configurar el observer cuando el DOM esté listo
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", setupNavbarObserver);
} else {
setupNavbarObserver();
}
// Exportar funciones para uso global
window.initNavbarAuth = initNavbarAuth;
window.isUserAuthenticated = isUserAuthenticated;
window.updateNavbarAuth = updateNavbarAuth;
;// Navbar loader - Carga el componente navbar dinámicamente
document.addEventListener("DOMContentLoaded", function () {
const placeholder = document.getElementById("navbar-placeholder");
if (!placeholder) {
return;
}
fetch("Navbar/navbar.html")
.then((res) => {
if (!res.ok) {
throw new Error(`HTTP error! status: ${res.status}`);
}
return res.text();
})
.then((html) => {
placeholder.innerHTML = html;
// Extraer y ejecutar los scripts del navbar
const scripts = placeholder.querySelectorAll("script");
scripts.forEach((oldScript) => {
const newScript = document.createElement("script");
Array.from(oldScript.attributes).forEach((attr) =>
newScript.setAttribute(attr.name, attr.value)
);
newScript.textContent = oldScript.textContent;
document.body.appendChild(newScript);
oldScript.remove();
});
// Ejecutar el script del navbar después de insertarlo
setTimeout(async () => {
if (typeof initNavbarAuth === "function") {
await initNavbarAuth();
} else {
console.error("initNavbarAuth no está disponible");
}
}, 100);
})
.catch((error) => {
console.error("Error loading navbar:", error);
// Fallback: Insertar navbar directamente
loadNavbarDirectly();
});
});
function loadNavbarDirectly() {
const navbarHTML = `
<header class="header-bar">
<h1 style="display:flex;align-items:center;gap:.5rem;margin:0;">
<span class="logo-circle" aria-hidden="true"
style="width:36px;height:36px;border-radius:50%;display:inline-block;background:url(../img/LOGO+CIRCULO.webp?=v) center/cover;overflow:hidden;">
</span>
<a href="Home.html" style="text-decoration:none;color:inherit;">Origami</a>
</h1>
<nav class="nav-bar">
<a href="Home.html">Inicio</a>
<a href="Tienda.html">Tienda</a>
<a href="Nosotros/nosotros.html">Contacto</a>
<a class="carrito" id="cartButton" aria-label="Carrito" href="javascript:void(0)">
<i class="fa-solid fa-cart-shopping"></i>
<span id="cartCount" class="cart-badge" aria-live="polite">0</span>
</a>
<div class="nav-search">
<input id="search" class="nav-search__input" type="search" placeholder="Buscar…" />
<label for="search" class="nav-search__btn">
<i class="fa-solid fa-magnifying-glass"></i>
</label>
</div>
<a href="auth/login.html" class="btn-login" id="authButton" aria-label="Iniciar sesión">
<i class="fa-regular fa-user"></i>
<span class="btn-login__label">Iniciar sesión</span>
</a>
</nav>
</header>
`;
document.getElementById("navbar-placeholder").innerHTML = navbarHTML;
// También ejecutar la función de autenticación
setTimeout(async () => {
if (typeof initNavbarAuth === "function") {
await initNavbarAuth();
} else {
console.error("initNavbarAuth no está disponible");
}
}, 100);
}
;// Footer loader - Carga el componente footer dinámicamente
const footerPlaceholder = document.getElementById("footer-placeholder");
if (footerPlaceholder) {
fetch("Footer/footer.html")
.then((r) => r.text())
.then((html) => {
footerPlaceholder.innerHTML = html;
});
}
;// ==================== STORE INTEGRATION ====================
class StoreIntegration {
constructor() {
this.init();
}
init() {
this.loadProductsFromAdmin();
this.setupProductInteractions();
// this.updateProductDisplay();
}
// Load products from admin storage
loadProductsFromAdmin() {
try {
// Check if admin storage exists
const adminProducts = localStorage.getItem("admin_products");
const adminCategories = localStorage.getItem("admin_categories");
if (adminProducts && adminCategories) {
this.products = JSON.parse(adminProducts);
this.categories = JSON.parse(adminCategories);
this.updateStoreDisplay();
} else {
// Fallback to hardcoded products if no admin data
this.loadDefaultProducts();
}
} catch (error) {
console.error("Error loading admin products:", error);
this.loadDefaultProducts();
}
}
loadDefaultProducts() {
// Default products that match the existing HTML structure
this.products = [
{
id: "iphone-17-256",
name: "iPhone 17",
brand: "Apple",
model: "iPhone 17",
basePrice: 1299,
image:
"https://media.bananacomputer.com/iPhone_17_White_2-up_Screen__USEN.png",
status: "active",
description: "El último iPhone con tecnología de vanguardia",
},
{
id: "samsung-s25",
name: "Samsung Galaxy S25",
brand: "Samsung",
model: "Galaxy S25",
basePrice: 1099,
image:
"https://images.samsung.com/is/image/samsung/assets/global/galaxy-s23/galaxy-s23_highlights_kv_mo.jpg",
status: "active",
description: "El flagship de Samsung más avanzado",
},
];
}
updateStoreDisplay() {
// Update homepage products
this.updateHomepageProducts();
// Update store page if exists
this.updateStorePage();
}
updateHomepageProducts() {
const cardsSection = document.getElementById("cards");
if (!cardsSection) return;
// Get active products
const activeProducts = this.products
.filter((p) => p.status === "active")
.slice(0, 6);
// Update existing cards or create new ones
const existingCards = cardsSection.querySelectorAll(".card");
activeProducts.forEach((product, index) => {
let cardElement = existingCards[index];
if (cardElement) {
// Update existing card
this.updateProductCard(cardElement, product);
} else {
// Create new card
this.createProductCard(cardsSection, product);
}
});
// Remove excess cards
for (let i = activeProducts.length; i < existingCards.length; i++) {
existingCards[i].remove();
}
}
updateProductCard(cardElement, product) {
const nameElement = cardElement.querySelector("h3");
const imageElement = cardElement.querySelector("img");
const descElement = cardElement.querySelector("p");
const priceElement = cardElement.querySelector(".card__price");
const linkElement = cardElement.closest("a");
if (nameElement) nameElement.textContent = product.name;
if (imageElement) {
imageElement.src = product.image;
imageElement.alt = product.name;
}
if (descElement)
descElement.textContent =
product.description || `${product.brand} ${product.model}`;
if (priceElement)
priceElement.textContent = `$${product.basePrice.toLocaleString()}`;
if (linkElement) linkElement.href = this.getProductUrl(product);
}
createProductCard(container, product) {
const cardHTML = `
<a href="${this.getProductUrl(
product
)}" target="_blank" style="text-decoration:none; color:inherit;">
<div class="glass-effect card" style="flex:0 0 260px; min-height:200px; padding:1.5rem; border-radius:var(--medium-radius);">
<h3>${product.name}</h3>
<figure class="card__media">
<img src="${product.image}" alt="${product.name}" loading="lazy" />
</figure>
<p>${product.description || `${product.brand} ${product.model}`}</p>
<div class="card__price">$${product.basePrice.toLocaleString()}</div>
</div>
</a>
`;
container.insertAdjacentHTML("beforeend", cardHTML);
}
updateStorePage() {
const storeGrid = document.getElementById("grid");
if (!storeGrid) return;
// Clear existing products
storeGrid.innerHTML = "";
// Get active products
const activeProducts = this.products.filter((p) => p.status === "active");
activeProducts.forEach((product) => {
const category = this.categories
? this.categories.find((c) => c.id === product.categoryId)
: null;
const cardHTML = `
<article class="card glass-effect"
data-model="${product.name}"
data-capacity="256GB"
data-cat="${product.brand.toLowerCase()}"
data-type="celulares"
onclick="window.location.href='${this.getProductUrl(
product
)}'">
<h3 class="card__title">${product.name}</h3>
<figure class="card__media">
<img src="${product.image}" alt="${product.name}">
</figure>
<p class="card__desc">${
product.description || `${product.brand} ${product.model}`
}</p>
<div class="card__price">$${product.basePrice.toLocaleString()}</div>
</article>
`;
storeGrid.insertAdjacentHTML("beforeend", cardHTML);
});
}
getProductUrl(product) {
// For now, redirect to the generic product page
// In the future, this could be dynamic based on product ID
return "DetalleProducto.html";
}
setupProductInteractions() {
// Listen for admin data changes
window.addEventListener("storage", (e) => {
if (e.key === "admin_products" || e.key === "admin_categories") {
this.loadProductsFromAdmin();
}
});
// Refresh data periodically (in case of same-tab admin changes)
setInterval(() => {
this.loadProductsFromAdmin();
}, 30000); // Every 30 seconds
}
// Method to manually refresh from admin panel
refreshFromAdmin() {
this.loadProductsFromAdmin();
this.showNotification(
"Productos actualizados desde el panel de administración"
);
}
showNotification(message) {
const notification = document.createElement("div");
notification.className = "store-notification";
notification.innerHTML = `
<i class="fa-solid fa-check-circle"></i>
${message}
`;
// Add notification styles
if (!document.querySelector("#notification-styles")) {
const styles = document.createElement("style");
styles.id = "notification-styles";
styles.textContent = `
.store-notification {
position: fixed;
top: 100px;
right: 20px;
background: rgba(76, 175, 80, 0.9);
backdrop-filter: blur(10px);
border: 1px solid rgba(76, 175, 80, 0.3);
border-radius: 15px;
padding: 1rem 1.5rem;
color: white;
z-index: 9999;
display: flex;
align-items: center;
gap: 0.5rem;
animation: slideInRight 0.3s ease;
max-width: 300px;
font-size: 0.9rem;
}
@keyframes slideInRight {
from { transform: translateX(100%); opacity: 0; }
to { transform: translateX(0); opacity: 1; }
}
`;
document.head.appendChild(styles);
}
document.body.appendChild(notification);
// Auto remove
setTimeout(() => {
notification.style.animation = "slideInRight 0.3s ease reverse";
setTimeout(() => notification.remove(), 300);
}, 3000);
}
updateProductDisplay() {
// Method for updating product display - can be expanded as needed
////console.log('Product display updated');
}
}
// Initialize store integration when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
window.storeIntegration = new StoreIntegration();
});
// Global function to refresh from admin
window.refreshStoreFromAdmin = () => {
if (window.storeIntegration) {
window.storeIntegration.refreshFromAdmin();
}
};
;// Home products loader - Carga productos desde el backend
document.addEventListener("DOMContentLoaded", () => {
const container = document.getElementById("home-products");
const iphoneContainer = document.getElementById("home-iphone");
if (!container || !iphoneContainer) {
return;
}
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
: "/img/LOGO+CIRCULO.webp";
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
;// Tienda filters and pagination
(function () {
const grid = document.getElementById("grid");
const pager = document.getElementById("pager");
if (!grid || !pager) {
return;
}
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
const apiUrl = window.frontendConfig ? window.frontendConfig.getApiUrl("/api/Producto/paged") : "/api/Producto/paged";
const res = await axios.get(apiUrl, {
params: { page: 1, pageSize: 100, soloActivos: true },
});
const data = res.data || {};
products = Array.isArray(data.items)
? data.items
: Array.isArray(res.data)
? res.data
: [];
} catch (e) {
console.warn("Paged endpoint falló, usando /api/Producto/activos:", e);
const fallbackUrl = window.frontendConfig ? window.frontendConfig.getApiUrl("/api/Producto/activos") : "/api/Producto/activos";
const fallback = await axios.get(fallbackUrl);
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
// Filtrar solo productos activos
//console.log('Productos ANTES del filtro:', products.length);
//console.log('Ejemplo de producto:', products[0]);
products = products.filter((p) => {
const estado = (p.estado || p.Estado || "").toLowerCase();
const esActivo = estado === "active" || estado === "";
if (!esActivo) {
//console.log('Producto FILTRADO (inactivo):', p.Marca || p.marca, p.Modelo || p.modelo, 'Estado:', estado);
}
return esActivo;
});
//console.log('Productos DESPUÉS del filtro:', products.length);
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
: "/img/LOGO+CIRCULO.webp";
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
})();
;// ==================== detalleproducto.JS - Product Detail Page ====================
// Obtener el ID del producto desde la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
let BASE = 0; // precio base (se actualizará con datos reales)
const fmt = (v) => "$" + v.toLocaleString("en-US");
// Variables que se inicializarán cuando el DOM esté listo
let img,
priceEl,
sumModel,
// COMENTADO: Ya no se selecciona por RAM
// sumRam,
sumColor,
sumCap,
sumQty,
sumCondicion,
condicionValueEl;
let qtyHelpEl, plusBtn, minusBtn;
let colorDelta = 0,
capDelta = 0,
// COMENTADO: Ya no se selecciona por RAM
// ramDelta = 0,
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
//////console.log("Precio:", unitPrice, "Stock:", stock);
// Mostrar condición si existe
const condicionName = variant
? variant.CondicionNombre || variant.condicionNombre || ""
: "";
if (sumCondicion) sumCondicion.textContent = condicionName || "-";
if (condicionValueEl) condicionValueEl.textContent = condicionName || "-";
// Enforce qty by stock and update UI state
enforceQtyByStock(stock);
}
// Obtener variante actual según selección (sin RAM)
function getCurrentVariant() {
// COMENTADO: Ya no se selecciona por RAM
// const selectedRam = document.querySelector("#ramRow .detalle-opt.is-active")
//   ?.dataset.ram;
const selectedColor = document.querySelector(".detalle-swatch.is-active")
?.dataset.color;
const selectedStorage = document.querySelector(
"#capRow .detalle-opt.is-active"
)?.dataset.cap;
/*  ////console.log("Buscando variante:", {
selectedColor,
selectedStorage,
}); */
const found = allVariants.find((v) => {
// COMENTADO: Ya no se selecciona por RAM
// const vRam = v.Ram || v.ram;
const vColor = v.Color || v.color;
const vStorage = v.Almacenamiento || v.almacenamiento;
// Si no hay almacenamiento seleccionado o la variante no tiene almacenamiento,
// buscar solo por color
const storageMatch = !selectedStorage || !vStorage
? true
: vStorage === selectedStorage;
return (
vColor === selectedColor &&
storageMatch
);
});
//////console.log("Variante encontrada:", found);
return found;
}
// Filtrar opciones disponibles según selección (sin RAM)
function filterAvailableOptions() {
const selectedStorage = document.querySelector(
"#capRow .detalle-opt.is-active"
)?.dataset.cap;
//////console.log('Filtering options. Selected storage:', selectedStorage);
// COMENTADO: Ya no se filtran almacenamientos por RAM
// Todos los almacenamientos están disponibles
// Filtrar colores disponibles según Almacenamiento
if (selectedStorage) {
const availableColors = [
...new Set(
allVariants
.filter(
(v) =>
(v.Almacenamiento || v.almacenamiento) === selectedStorage
)
.map((v) => v.Color || v.color)
),
].filter(Boolean);
// ////console.log('Available colors for storage', selectedStorage, ':', availableColors);
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
updateProductImage();
}
}
} else {
// Si no hay almacenamiento seleccionado, habilitar todos los colores
// ////console.log('Not filtering colors - waiting for storage selection');
document.querySelectorAll(".detalle-swatch").forEach((btn) => {
btn.disabled = false;
btn.style.opacity = "1";
});
}
}
// Actualiza la imagen del producto según la variante seleccionada
function updateProductImage() {
const variant = getCurrentVariant();
if (variant && (variant.Imagen || variant.imagen)) {
// Si la variante tiene imagen específica, usarla
const variantImg = variant.Imagen || variant.imagen;
img.src = `data:image/webp;base64,${variantImg}`;
} else {
// Si no hay imagen de variante, buscar por color únicamente
const selectedColor = document.querySelector(".detalle-swatch.is-active")?.dataset.color;
if (selectedColor) {
const varianteConImagen = allVariants.find(v =>
(v.Color || v.color) === selectedColor &&
(v.Imagen || v.imagen)
);
if (varianteConImagen) {
const colorImg = varianteConImagen.Imagen || varianteConImagen.imagen;
img.src = `data:image/webp;base64,${colorImg}`;
}
}
}
}
// Event Listeners
function setupEventListeners() {
const colorRow = document.getElementById("colorRow");
const capRow = document.getElementById("capRow");
const qtyRow = document.getElementById("qtyRow");
if (!colorRow || !capRow || !qtyRow) {
return;
}
// Colores
colorRow.addEventListener("click", (e) => {
const b = e.target.closest(".detalle-swatch");
if (!b || b.disabled) return;
document
.querySelectorAll(".detalle-swatch")
.forEach((x) => x.classList.remove("is-active"));
b.classList.add("is-active");
colorDelta = +b.dataset.delta || 0;
sumColor.textContent = b.dataset.color;
updateProductImage();
calc();
});
// COMENTADO: Ya no se selecciona por RAM
// document.getElementById("ramRow").addEventListener("click", (e) => {
//   const b = e.target.closest(".detalle-opt");
//   if (!b) return;
//   document
//     .querySelectorAll("#ramRow .detalle-opt")
//     .forEach((x) => x.classList.remove("is-active"));
//   b.classList.add("is-active");
//   ramDelta = +b.dataset.delta || 0;
//   sumRam.textContent = b.dataset.ram;
//   // Filtrar opciones disponibles
//   filterAvailableOptions();
//   calc();
// });
// Capacidad
capRow.addEventListener("click", (e) => {
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
updateProductImage();
calc();
});
// Cantidad 1..5
qtyRow.addEventListener("click", (e) => {
const b = e.target.closest(".detalle-opt");
if (!b) return;
const op = b.dataset.q;
const current = getCurrentVariant();
const stock = current ? current.Stock || current.stock || 0 : 0;
if (op === "+1") qty = Math.min(stock > 0 ? stock : 0, qty + 1);
if (op === "-1") qty = Math.max(1, qty - 1);
const qtyEl = document.getElementById("qty");
if (qtyEl) {
qtyEl.textContent = qty;
}
sumQty.textContent = qty;
calc();
});
// Botón de consultar por WhatsApp
const buyBtn = document.getElementById("buyBtn");
if (!buyBtn) {
return;
}
buyBtn.addEventListener("click", (e) => {
const variant = getCurrentVariant();
if (!variant) {
alert("Por favor, seleccioná las opciones del producto.");
return;
}
// Número de WhatsApp (sin +, espacios ni guiones)
const phoneNumber = "5491172376181";
// Construir mensaje (sin RAM)
const model = document.getElementById("detalleModel")?.textContent || "Producto";
// COMENTADO: Ya no se selecciona por RAM
// const ram = document.querySelector("#ramRow .detalle-opt.is-active")?.dataset.ram || "";
const storage = document.querySelector("#capRow .detalle-opt.is-active")?.dataset.cap || "";
const color = document.querySelector(".detalle-swatch.is-active")?.dataset.color || "";
const condicion = variant?.CondicionNombre || variant?.condicionNombre || "";
const unitPrice = variant.Precio || variant.precio || 0;
const total = unitPrice * qty;
let message = `Hola, quisiera consultar por el siguiente producto:\n\n`;
message += `📱 *${model}*\n`;
// COMENTADO: Ya no se incluye RAM en el mensaje
// message += `   RAM: ${ram}\n`;
if (storage) message += `   Almacenamiento: ${storage}\n`;
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
alert("Por favor, seleccioná las opciones del producto.");
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
// COMENTADO: Ya no se selecciona por RAM
// ram:
//   document.querySelector("#ramRow .detalle-opt.is-active")?.dataset
//     .ram || "",
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
//////console.log("Adding to cart:", product);
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
////console.log("Fetching product with ID:", productId);
const apiUrl = window.frontendConfig ? window.frontendConfig.getApiUrl(`/api/Producto/${productId}`) : `/api/Producto/${productId}`;
const res = await axios.get(apiUrl);
const product = res.data;
if (!product) {
alert("Producto no encontrado");
window.location.href = "Tienda.html";
return;
}
////console.log("Product loaded:", product);
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
////console.log("Fetching variants for product ID:", productId);
const variantesUrl = window.frontendConfig ? window.frontendConfig.getApiUrl(`/api/Producto/${productId}/variantes`) : `/api/Producto/${productId}/variantes`;
const variantesRes = await axios.get(variantesUrl);
////console.log("Variants API response:", variantesRes);
const variantes = Array.isArray(variantesRes.data) ? variantesRes.data : [];
////console.log("Variantes cargadas:", variantes);
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
// Obtener opciones únicas de Almacenamiento y Color (sin RAM)
// COMENTADO: Ya no se obtienen opciones de RAM
// const ramOptions = [...new Set(variantes.map((v) => v.Ram || v.ram))]
//   .filter(Boolean)
//   .sort();
const storageOptions = [
...new Set(variantes.map((v) => v.Almacenamiento || v.almacenamiento)),
]
.filter(Boolean)
.sort();
const colorOptions = [
...new Set(variantes.map((v) => v.Color || v.color)),
].filter(Boolean);
////console.log("Opciones:", {
/*   storageOptions,
colorOptions,
}); */
// COMENTADO: Ya no se construyen botones de RAM
// const ramRow = document.getElementById("ramRow");
// ramRow.innerHTML = "";
// ramOptions.forEach((ram, idx) => {
//   const btn = document.createElement("button");
//   btn.className = "detalle-opt" + (idx === 0 ? " is-active" : "");
//   btn.dataset.ram = ram;
//   btn.dataset.delta = 0;
//   btn.textContent = ram;
//   ramRow.appendChild(btn);
// });
// Construir botones de color (solo círculo sin texto)
const colorRow = document.getElementById("colorRow");
colorRow.innerHTML = "";
colorOptions.forEach((color, idx) => {
const btn = document.createElement("button");
btn.className = "detalle-swatch" + (idx === 0 ? " is-active" : "");
btn.title = color;
btn.dataset.color = color;
btn.dataset.delta = 0;
// Buscar variante con este color para obtener su imagen específica
const varianteConImagen = variantes.find(v =>
(v.Color || v.color) === color &&
(v.Imagen || v.imagen)
);
// Usar imagen de variante si existe, sino la del producto base
const varianteImg = varianteConImagen ?
(varianteConImagen.Imagen || varianteConImagen.imagen) : null;
btn.dataset.img = varianteImg ?
`data:image/webp;base64,${varianteImg}` :
(imgBase64 ? `data:image/webp;base64,${imgBase64}` : "");
btn.style.setProperty("--c", getColorHex(color));
colorRow.appendChild(btn);
});
// Construir botones de almacenamiento (si existen)
const capRow = document.getElementById("capRow");
capRow.innerHTML = "";
if (storageOptions.length > 0) {
storageOptions.forEach((storage, idx) => {
const btn = document.createElement("button");
btn.className = "detalle-opt" + (idx === 0 ? " is-active" : "");
btn.dataset.cap = storage;
btn.dataset.delta = 0;
btn.textContent = storage;
capRow.appendChild(btn);
});
} else {
// Si no hay almacenamiento, ocultar la fila completa
const capSection = capRow.closest('.detalle-row');
if (capSection) capSection.style.display = 'none';
}
// Actualizar precio base con la primera variante
const firstVariant = variantes[0];
BASE = firstVariant ? firstVariant.Precio || firstVariant.precio || 0 : 0;
// Actualizar summary inicial (sin RAM)
// COMENTADO: Ya no se actualiza sumRam
// sumRam.textContent = ramOptions[0] || "N/A";
sumColor.textContent = colorOptions[0] || "N/A";
if (sumCap) {
sumCap.textContent = storageOptions[0] || "N/A";
// Si no hay almacenamiento, ocultar en el summary también
if (storageOptions.length === 0) {
const capSummaryRow = sumCap.closest('p, div, .summary-item');
if (capSummaryRow) capSummaryRow.style.display = 'none';
}
}
// Asignar condición inicial si viene en la primera variante
const initCond =
firstVariant?.CondicionNombre || firstVariant?.condicionNombre || "-";
if (sumCondicion) sumCondicion.textContent = initCond;
if (condicionValueEl) condicionValueEl.textContent = initCond;
// Aplicar filtros iniciales
filterAvailableOptions();
// Actualizar imagen inicial
updateProductImage();
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
// Inicializar referencias a elementos DOM (sin sumRam)
img = document.getElementById("detalleImg");
priceEl = document.getElementById("price");
sumModel = document.getElementById("sumModel");
// COMENTADO: Ya no se inicializa sumRam
// sumRam = document.getElementById("sumRam");
sumColor = document.getElementById("sumColor");
sumCap = document.getElementById("sumCap");
sumQty = document.getElementById("sumQty");
sumCondicion = document.getElementById("sumCondicion");
condicionValueEl = document.getElementById("condicionValue");
plusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="+1"]');
minusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="-1"]');
qtyHelpEl = document.querySelector("#qtyRow + .detalle-help");
////console.log("DOM loaded. Product ID:", productId);
////console.log("Elements initialized:", { img, priceEl, sumModel });
if (
!img ||
!priceEl ||
!sumModel ||
!sumColor ||
!sumCap ||
!sumQty
) {
return;
}
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
;// ==================== CART UI + STATE ====================
(function () {
const STORAGE_KEY = "cart_items";
function getItems() {
try {
return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
} catch {
return [];
}
}
function setItems(items) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function getCount() {
return getItems().reduce((s, it) => s + (Number(it.qty) || 0), 0);
}
function getTotal() {
return getItems().reduce(
(s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.qty) || 0),
0
);
}
function fmt(n) {
return "$" + Number(n).toLocaleString("en-US");
}
function renderBadge() {
const el = document.getElementById("cartCount");
if (!el) return;
el.textContent = getCount();
}
function renderModal() {
const list = document.getElementById("cartList");
const total = document.getElementById("cartTotal");
if (!list || !total) return;
const items = getItems();
// ////console.log('🛒 Rendering cart with items:', items);
list.innerHTML = "";
if (items.length === 0) {
list.innerHTML =
'<div style="padding: 24px 12px; text-align: center; opacity:.85;">Tu carrito está vacío.</div>';
} else {
items.forEach((it, idx) => {
const row = document.createElement("div");
row.className = "cart-item";
// COMENTADO: Ya no se muestra RAM
const metaText = `${it.storage}${
it.color ? " · " + it.color : ""
}${it.condicionNombre ? " · " + it.condicionNombre : ""}`;
/*  ////console.log(`📦 Item #${idx}:`, {
model: it.model,
variantId: it.variantId,
storage: it.storage,
color: it.color,
condicionNombre: it.condicionNombre,
hasCondicion: !!it.condicionNombre,
fullItem: it,
}); */
row.innerHTML = `
<img class="cart-item__img" src="${
it.img || "/img/LOGO+CIRCULO.webp"
}" alt="${it.model}">
<div class="cart-item__info">
<div class="cart-item__title">${it.model}</div>
<div class="cart-item__meta">${metaText}</div>
<div class="cart-item__price">${fmt(it.unitPrice)}</div>
<div class="cart-item__qty">
<button data-act="dec" data-idx="${idx}">−</button>
<span>${it.qty}</span>
<button data-act="inc" data-idx="${idx}">+</button>
<button data-act="del" data-idx="${idx}" style="margin-left:8px">🗑️</button>
</div>
</div>
`;
list.appendChild(row);
});
}
total.textContent = fmt(getTotal());
// Completar condiciones faltantes de manera perezosa
completeMissingConditions();
}
function openModal() {
const m = document.getElementById("cartModal");
if (!m) return;
m.classList.add("is-open");
m.setAttribute("aria-hidden", "false");
renderModal();
}
function closeModal() {
const m = document.getElementById("cartModal");
if (!m) return;
m.classList.remove("is-open");
m.setAttribute("aria-hidden", "true");
}
function handleModalClicks(e) {
const btn = e.target.closest("[data-cart-close]");
if (btn) {
closeModal();
return;
}
const actBtn = e.target.closest("button[data-act]");
if (!actBtn) return;
const idx = Number(actBtn.dataset.idx);
const act = actBtn.dataset.act;
const items = getItems();
const it = items[idx];
if (!it) return;
if (act === "inc") {
it.qty = Math.min(it.stock || 99, (Number(it.qty) || 0) + 1);
}
if (act === "dec") {
it.qty = Math.max(1, (Number(it.qty) || 0) - 1);
}
if (act === "del") {
items.splice(idx, 1);
}
setItems(items);
renderBadge();
renderModal();
}
// Función para Cotizar por WhatsApp
function sendToWhatsApp() {
const items = getItems();
if (items.length === 0) {
alert("Tu carrito está vacío");
return;
}
// Número de WhatsApp (incluir código de país sin +, ej: 5491234567890)
const phoneNumber = "5491172376181"; // CAMBIAR POR TU NÚMERO
// Construir mensaje (sin RAM)
let message =
"Hola, quisiera hacer un pedido: 🛒 *Mi Lista de Productos*\n\n";
items.forEach((it, idx) => {
message += `${idx + 1}. *${it.model}*\n`;
// COMENTADO: Ya no se incluye RAM en el mensaje
message += `   📱 ${it.storage}`;
if (it.color) message += ` · ${it.color}`;
if (it.condicionNombre) message += ` · ${it.condicionNombre}`;
message += `\n   💰 ${fmt(it.unitPrice)} x ${it.qty} = ${fmt(
it.unitPrice * it.qty
)}\n\n`;
});
message += `*Total: ${fmt(getTotal())}*\n\n`;
message += "¡Espero tu respuesta! 😊";
// Codificar mensaje para URL
const encodedMessage = encodeURIComponent(message);
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
// Abrir WhatsApp
window.open(whatsappUrl, "_blank");
}
// Delegación de eventos para soportar navbar inyectado dinámicamente
document.addEventListener("click", (e) => {
if (e.target.closest("#cartButton")) {
e.preventDefault();
openModal();
}
if (e.target.closest("[data-cart-close]")) {
e.preventDefault();
closeModal();
}
if (e.target.closest("button[data-act]")) {
handleModalClicks(e);
}
if (e.target.closest("#sendWhatsAppBtn")) {
e.preventDefault();
sendToWhatsApp();
}
});
// Carga el modal del carrito
function loadCartModal() {
if (document.getElementById("cartModal")) return Promise.resolve();
return fetch("../components/cart-modal.html")
.then((r) => r.text())
.then((html) => {
const temp = document.createElement("div");
temp.innerHTML = html;
const modal = temp.querySelector("#cartModal");
if (modal) document.body.appendChild(modal);
})
.catch((err) => console.error("Error loading cart modal:", err));
}
// Render inmediato y cuando aparezca el navbar
document.addEventListener("DOMContentLoaded", () => {
loadCartModal().then(() => {
ensureModalInBody();
renderBadge();
});
// Observa el DOM hasta que exista #cartCount (navbar cargado por fetch)
if (!document.getElementById("cartCount")) {
const obs = new MutationObserver(() => {
const hasCount = document.getElementById("cartCount");
if (!document.getElementById("cartModal")) loadCartModal();
if (hasCount) {
renderBadge();
obs.disconnect();
}
});
obs.observe(document.documentElement, { childList: true, subtree: true });
}
});
window.addEventListener("storage", (e) => {
if (e.key === STORAGE_KEY) {
renderBadge();
renderModal();
}
});
window.refreshCartBadge = renderBadge;
function ensureModalInBody() {
const modal = document.getElementById("cartModal");
if (modal && modal.parentElement !== document.body) {
document.body.appendChild(modal);
}
}
async function completeMissingConditions() {
const items = getItems();
//////console.log("🔍 Checking for missing conditions in cart items:", items);
const missing = items
.map((it, idx) => ({ it, idx }))
.filter((x) => !x.it.condicionNombre && x.it.variantId);
//////console.log(`📋 Found ${missing.length} items without condition`);
if (missing.length === 0) return;
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
await Promise.all(
missing.map(async ({ it, idx }) => {
try {
//   ////console.log(`🔎 Fetching condition for variant ${it.variantId}...`);
const variantUrl = window.frontendConfig ? window.frontendConfig.getApiUrl(`/api/Producto/variante/${it.variantId}`) : `/api/Producto/variante/${it.variantId}`;
const res = await axios.get(variantUrl);
const data = res.data || {};
// ////console.log(`✅ API response for variant ${it.variantId}:`, data);
const cond = data.CondicionNombre || data.condicionNombre || "";
// ////console.log(`📦 Condition found: "${cond}"`);
if (cond) {
items[idx].condicionNombre = cond;
// ////console.log(`✔️ Updated item ${idx} with condition: ${cond}`);
} else {
console.warn(`⚠️ No condition found for variant ${it.variantId}`);
}
} catch (err) {
console.error(
`❌ Error fetching condition for variant ${it.variantId}:`,
err
);
}
})
);
//  ////console.log("💾 Saving updated items to localStorage:", items);
setItems(items);
renderModal();
} catch (err) {
console.error("❌ Error in completeMissingConditions:", err);
}
}
})();
;// Navbar authentication state manager
function updateNavbarButton() {
const authButton = document.getElementById("authButton");
if (!authButton) {
return;
}
// Verificar múltiples posibles nombres de keys
const token =
localStorage.getItem("token") ||
localStorage.getItem("authToken") ||
localStorage.getItem("jwt") ||
localStorage.getItem("accessToken") ||
sessionStorage.getItem("token") ||
sessionStorage.getItem("authToken");
////console.log('Token encontrado:', token); // Para debug
////console.log('LocalStorage keys:', Object.keys(localStorage)); // Para debug
if (token && token !== "null" && token !== "") {
// Usuario logueado - cambiar a "Volver al Panel"
authButton.href = "../admin/dashboard.html";
authButton.setAttribute("aria-label", "Volver al Panel");
const label = authButton.querySelector(".btn-login__label");
if (label) {
label.textContent = "Volver al Panel";
}
const icon = authButton.querySelector("i");
if (icon) {
icon.className = "fa-solid fa-gauge";
}
////console.log('Botón actualizado a "Ir al Panel"');
} else {
////console.log('No hay token válido encontrado');
}
}
document.addEventListener("DOMContentLoaded", updateNavbarButton);
if (document.readyState !== "loading") {
updateNavbarButton();
}
window.updateNavbarButton = updateNavbarButton;
;// Publi page - Navbar and Footer loader
const navbarPlaceholder = document.getElementById("navbar-placeholder");
const footerPlaceholder = document.getElementById("footer-placeholder");
if (navbarPlaceholder) {
// Carga Navbar y Footer
fetch("Navbar/navbar.html")
.then((r) => r.text())
.then((h) => {
navbarPlaceholder.innerHTML = h;
// Ejecutar la función de autenticación después de cargar el navbar
setTimeout(async () => {
if (typeof initNavbarAuth === "function") {
await initNavbarAuth();
} else {
console.error("initNavbarAuth no está disponible");
}
}, 100);
});
}
if (footerPlaceholder) {
fetch("Footer/footer.html")
.then((r) => r.text())
.then((h) => {
footerPlaceholder.innerHTML = h;
});
}
// Botón flotante para volver al panel si el admin está autenticado
(async function addReturnToAdminIfAuthenticated() {
try {
// Cargar axios si no está disponible (ya se usa en admin, pero aquí puede no estar)
if (typeof axios === "undefined") {
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
await new Promise((resolve, reject) => {
script.onload = resolve;
script.onerror = reject;
document.head.appendChild(script);
});
}
const apiBase = window.apiConfig.apiUrl;
const res = await axios.get(`${apiBase}/api/Admin/verify`, {
withCredentials: true,
});
if (res?.data?.isAuthenticated) {
const btn = document.createElement("a");
btn.href = "/admin/dashboard.html";
btn.setAttribute("aria-label", "Volver al panel de administración");
btn.style.position = "fixed";
btn.style.bottom = "20px";
btn.style.right = "20px";
btn.style.zIndex = "10000";
btn.style.padding = "0.8rem 1rem";
btn.style.borderRadius = "999px";
btn.style.background = "rgba(255,255,255,0.15)";
btn.style.backdropFilter = "blur(10px)";
btn.style.border = "1px solid rgba(255,255,255,0.25)";
btn.style.color = "#fff";
btn.style.textDecoration = "none";
btn.style.display = "flex";
btn.style.alignItems = "center";
btn.style.gap = ".5rem";
btn.innerHTML = '<i class="fa-solid fa-gauge"></i> Volver al Panel';
document.body.appendChild(btn);
}
} catch (e) {
// Usuario no autenticado, no mostrar botón
}
})();
;// ==================== EMAILJS CONFIGURATION ====================
// Configuración para el envío automático de emails desde el formulario de contacto
// IMPORTANTE: Reemplaza estos valores con tus credenciales de EmailJS
const EMAILJS_CONFIG = {
// Tu clave pública de EmailJS (puedes encontrarla en tu dashboard de EmailJS)
PUBLIC_KEY: "MReLwCmP7Eyv4sFUL",
// ID del servicio de email (Gmail, Outlook, etc.)
SERVICE_ID: "service_l9mwc9b",
// ID de la plantilla de email que creaste en EmailJS
TEMPLATE_ID: "template_ficnd3i",
// Tu email de destino (donde recibirás los mensajes)
TO_EMAIL: "origami.importadosok@gmail.com",
};
// Función para inicializar EmailJS
function initEmailJS() {
if (typeof emailjs !== "undefined") {
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
////console.log('EmailJS inicializado correctamente');
} else {
console.error("EmailJS no está cargado");
}
}
// Función para enviar email
function sendContactEmail(formData) {
return new Promise((resolve, reject) => {
if (typeof emailjs === "undefined") {
reject(new Error("EmailJS no está disponible"));
return;
}
const templateParams = {
from_name: formData.from_name,
from_email: formData.from_email,
message: formData.message,
to_email: EMAILJS_CONFIG.TO_EMAIL,
current_date: new Date().toLocaleDateString("es-ES", {
year: "numeric",
month: "long",
day: "numeric",
hour: "2-digit",
minute: "2-digit",
}),
current_time: new Date().toLocaleTimeString("es-ES", {
hour: "2-digit",
minute: "2-digit",
}),
};
emailjs
.send(
EMAILJS_CONFIG.SERVICE_ID,
EMAILJS_CONFIG.TEMPLATE_ID,
templateParams
)
.then(function (response) {
////console.log('Email enviado exitosamente:', response);
resolve(response);
})
.catch(function (error) {
console.error("Error al enviar email:", error);
reject(error);
});
});
}
// Exportar configuración para uso global
window.EMAILJS_CONFIG = EMAILJS_CONFIG;
window.initEmailJS = initEmailJS;
window.sendContactEmail = sendContactEmail;
