using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace OrigamiBack.Data.Modelos
{
    public class ProductosVariantes
    {
        [Key]
        public int Id { get; set; }
        public int ProductoId { get; set; }
        [Column("stock")]
        [Required]
        public int Stock { get; set; }
        [Column("color")]
        public string? Color { get; set; }
        // NULLABLE: Ya no se selecciona por RAM, pero se mantiene para compatibilidad con BD
        [Column("ram")]
        public string? Ram { get; set; }
        // Almacenamiento ahora acepta null
        [Column("almacenamiento")]
        public string? Almacenamiento { get; set; }
        [Column("precio")]
        [Required]
        public decimal Precio { get; set; }

        // Imagen específica de la variante (opcional)
        [Column("imagen")]
        public byte[]? Imagen { get; set; }

        [JsonIgnore]
        public Productos? Producto { get; set; }

        [JsonIgnore]
        public CondicionProducto? Condicion { get; set; }
        [Column("condicion_id")]
        public int? CondicionId { get; set; }

    }
}
