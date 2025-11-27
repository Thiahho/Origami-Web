// ==================== DETALLE PRODUCTO ====================
const BASE = 540
const fmt = (v) => "$" + v.toLocaleString("en-US")

// Referencias DOM
let img, priceEl, sumModel, sumRam, sumColor, sumCap, sumQty, sumCondicion
let qty = 1

// Datos de ejemplo (reemplazar con API)
const productData = {
  id: "1",
  model: "Apple iPhone 13",
  img: "producto.png",
  variants: [
    { ram: "4gb", storage: "128", color: "Star", price: 540, stock: 1, condicion: "Usado" },
    { ram: "4gb", storage: "256", color: "Star", price: 620, stock: 3, condicion: "Usado" },
    { ram: "4gb", storage: "128", color: "Graphite", price: 530, stock: 2, condicion: "Usado" },
    { ram: "4gb", storage: "256", color: "Graphite", price: 610, stock: 0, condicion: "Usado" },
  ],
}

function getCurrentVariant() {
  const selectedRam = document.querySelector("#ramRow .detalle-opt.is-active")?.dataset.ram
  const selectedColor = document.querySelector(".detalle-swatch.is-active")?.dataset.color
  const selectedStorage = document.querySelector("#capRow .detalle-opt.is-active")?.dataset.cap

  return productData.variants.find(
    (v) => v.ram === selectedRam && v.color === selectedColor && v.storage === selectedStorage,
  )
}

function calc() {
  const variant = getCurrentVariant()
  const unitPrice = variant ? variant.price : BASE
  const stock = variant ? variant.stock : 0
  const condicion = variant ? variant.condicion : "-"

  priceEl.textContent = fmt(unitPrice * qty)
  document.getElementById("stockInfo").textContent = stock > 0 ? `Stock disponible: ${stock}` : "Sin stock"
  document.getElementById("condicionValue").textContent = condicion
  if (sumCondicion) sumCondicion.textContent = condicion

  // Ajustar qty si excede stock
  if (qty > stock && stock > 0) {
    qty = stock
    document.getElementById("qty").textContent = qty
    sumQty.textContent = qty
  }

  // Habilitar/deshabilitar botones
  const plusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="+1"]')
  const minusBtn = document.querySelector('#qtyRow .detalle-opt[data-q="-1"]')
  const addBtn = document.getElementById("addToCartBtn")

  if (plusBtn) plusBtn.disabled = qty >= stock || stock === 0
  if (minusBtn) minusBtn.disabled = qty <= 1
  if (addBtn) addBtn.disabled = stock === 0
}

function setupEventListeners() {
  // RAM
  document.getElementById("ramRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-opt")
    if (!b) return
    document.querySelectorAll("#ramRow .detalle-opt").forEach((x) => x.classList.remove("is-active"))
    b.classList.add("is-active")
    sumRam.textContent = b.dataset.ram
    calc()
  })

  // Almacenamiento
  document.getElementById("capRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-opt")
    if (!b || b.disabled) return
    document.querySelectorAll("#capRow .detalle-opt").forEach((x) => x.classList.remove("is-active"))
    b.classList.add("is-active")
    sumCap.textContent = b.dataset.cap
    calc()
  })

  // Color
  document.getElementById("colorRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-swatch")
    if (!b || b.disabled) return
    document.querySelectorAll(".detalle-swatch").forEach((x) => x.classList.remove("is-active"))
    b.classList.add("is-active")
    sumColor.textContent = b.dataset.color
    calc()
  })

  // Cantidad
  document.getElementById("qtyRow").addEventListener("click", (e) => {
    const b = e.target.closest(".detalle-opt")
    if (!b) return
    const variant = getCurrentVariant()
    const stock = variant ? variant.stock : 0
    if (b.dataset.q === "+1") qty = Math.min(stock, qty + 1)
    if (b.dataset.q === "-1") qty = Math.max(1, qty - 1)
    document.getElementById("qty").textContent = qty
    sumQty.textContent = qty
    calc()
  })

  // Agregar al carrito
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    const variant = getCurrentVariant()
    if (!variant || variant.stock <= 0) {
      alert("Sin stock disponible.")
      return
    }

    const product = {
      productId: productData.id,
      model: productData.model,
      ram: sumRam.textContent,
      storage: sumCap.textContent,
      color: sumColor.textContent,
      condicionNombre: variant.condicion,
      variantId: `${productData.id}-${variant.ram}-${variant.storage}-${variant.color}`,
      unitPrice: variant.price,
      qty: qty,
      stock: variant.stock,
      img: img.src,
    }

    const key = "cart_items"
    const items = JSON.parse(localStorage.getItem(key) || "[]")
    const idx = items.findIndex((x) => x.variantId === product.variantId)
    if (idx >= 0) {
      items[idx].qty = Math.min(variant.stock, items[idx].qty + qty)
    } else {
      items.push(product)
    }
    localStorage.setItem(key, JSON.stringify(items))

    alert("✓ Producto agregado al carrito")
    if (window.refreshCartBadge) window.refreshCartBadge()
  })

  // Consultar
  document.getElementById("buyBtn").addEventListener("click", () => {
    const variant = getCurrentVariant()
    const msg = `Consulta: ${productData.model} - ${sumRam.textContent} - ${sumCap.textContent} - ${sumColor.textContent}`
    alert(msg)
  })
}

document.addEventListener("DOMContentLoaded", () => {
  img = document.getElementById("detalleImg")
  priceEl = document.getElementById("price")
  sumModel = document.getElementById("sumModel")
  sumRam = document.getElementById("sumRam")
  sumColor = document.getElementById("sumColor")
  sumCap = document.getElementById("sumCap")
  sumQty = document.getElementById("sumQty")
  sumCondicion = document.getElementById("sumCondicion")

  setupEventListeners()
  calc()
})
