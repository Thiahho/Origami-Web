using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
{
    [Table("condiciones_producto")]
    public class CondicionProducto
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(200)]
        public string? Descripcion { get; set; }

        [Column("orden")]
        public int Orden { get; set; } = 0;

        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relación inversa
        public ICollection<ProductosVariantes>? Variantes { get; set; }
    }
}

