using OrigamiBack.Data.Modelos;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace OrigamiBack.Data.Dtos
{
    public class ProductosVariantesDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }

        // NULLABLE: Ya no se selecciona por RAM, pero se mantiene para compatibilidad con BD
        public string? Ram { get; set; }

        // Almacenamiento ahora acepta null
        public string? Almacenamiento { get; set; }

        public string? Color { get; set; }

        [Required(ErrorMessage = "El precio es requerido")]
        [Range(0, double.MaxValue, ErrorMessage = "El precio debe ser mayor o igual a 0")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "El stock es requerido")]
        [Range(0, int.MaxValue, ErrorMessage = "El stock debe ser mayor o igual a 0")]
        public int Stock { get; set; }

        // Imagen específica de la variante (base64, opcional)
        public string? Imagen { get; set; }

        public ProductoDto? Producto { get; set; }
        public string? CondicionNombre { get; set; }
        public int? CondicionId { get; set; }

        // Campo para activar/desactivar variante sin eliminarla
        public bool Activo { get; set; } = true;
    }
}