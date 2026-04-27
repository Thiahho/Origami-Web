import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variante) => {
        const key = `${product.id}-${variante.id}`;
        const items = get().items;
        const existing = items.find((i) => i.key === key);

        if (existing) {
          set({ items: items.map((i) => i.key === key ? { ...i, qty: i.qty + 1 } : i) });
        } else {
          set({
            items: [...items, {
              key,
              productId: product.id,
              varianteId: variante.id,
              marca: product.Marca || product.marca,
              modelo: product.Modelo || product.modelo,
              almacenamiento: variante.Almacenamiento || variante.almacenamiento,
              color: variante.Color || variante.color,
              precio: variante.Precio || variante.precio,
              img: product.Img || product.img,
              qty: 1,
            }],
          });
        }
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQty: (key, qty) => {
        if (qty <= 0) return get().removeItem(key);
        set({ items: get().items.map((i) => i.key === key ? { ...i, qty } : i) });
      },

      clearCart: () => set({ items: [] }),

      get total() {
        return get().items.reduce((sum, i) => sum + i.precio * i.qty, 0);
      },

      get count() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
    }),
    { name: 'origami-cart' }
  )
);

export default useCartStore;
