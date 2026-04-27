// Configuración de secciones del home.
// Para agregar, quitar o reordenar secciones: editar este array.
// filter: función que recibe un producto y devuelve true/false
// limit: cuántos productos mostrar

window.homeSectionsConfig = [
  {
    id: "home-iphone",
    title: "Últimos iPhone",
    filter: (p) => (p.Marca || p.marca || "").toLowerCase() === "apple",
    limit: 3,
  },
  {
    id: "home-products",
    title: "Nuestros Equipos",
    filter: () => true,
    limit: 3,
  },
];
