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
        [Required]
        public required string Color { get; set; }
        // COMENTADO: Ya no se selecciona por RAM
        // [Column("ram")]
        // [Required]
        // public required string Ram { get; set; }
        [Column("almacenamiento")]
        public string? Almacenamiento { get; set; }
        [Column("precio")]
        [Required]
        public decimal Precio { get; set; }
        [JsonIgnore]
        public Productos? Producto { get; set; }

        [JsonIgnore]
        public CondicionProducto? Condicion { get; set; }
        [Column("condicion_id")]
        public int? CondicionId { get; set; }

    }
}
