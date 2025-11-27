using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
{
    [Table("categorias")]
    public class Categorias
    {
        [Key]
        public int Id { get; set; }
        [Column("Nombre")]
        public string? Nombre { get; set; }
        [Column("Descripcion")]
        public string? Descripcion { get; set; }
        public string? Icon { get; set; }
    }
}
