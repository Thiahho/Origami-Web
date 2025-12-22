using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrigamiBack.Data.Modelos
{
    public class Productos
    {
        [Key]
        public int Id { get; set; }
        [Column("marca")]
        [Required]
        public required string Marca { get; set; }
        [Column("modelo")]
        [Required]
        public required string Modelo { get; set; }
        [Column("categoria")]
        [Required]
        public required string Categoria { get; set; }
        [Column("estado")]
        public string Estado { get; set; } = "active";
        [Column("img")]
        [Required]
        public required byte[] Img { get; set; }

        public required ICollection<ProductosVariantes> Variantes { get; set; }

        public int GetTotalStock()
        {
            return Variantes?.Sum(v=>v.Stock)?? 0;
        }

        public decimal? GetBasePrice()
        {
            return Variantes?.Min(v => v.Precio);
        }

        // COMENTADO: Ya no se selecciona por RAM
        // public IEnumerable<string> GetAvailableRAM()
        // {
        //     return Variantes?.Select(v => v.Ram)
        //         .Where(r => r != null)
        //         .Distinct()
        //         .OrderBy(r => r) ?? Enumerable.Empty<string>();
        // }

        // Método para obtener los almacenamientos disponibles (sin filtro de RAM)
        public IEnumerable<string> GetAvailableStorage()
        {
            return Variantes?
                .Select(v => v.Almacenamiento)
                .Where(s => s != null)
                .Distinct()
                .OrderBy(s => s) ?? Enumerable.Empty<string>();
        }

        // Método para obtener los colores disponibles por almacenamiento (sin RAM)
        public IEnumerable<string> GetAvailableColors(string storage)
        {
            return Variantes?.Where(v => v.Almacenamiento== storage)
                .Select(v => v.Color)
                .Where(c => c != null)
                .Distinct()
                .OrderBy(c => c) ?? Enumerable.Empty<string>();
        }
        // Constructor con parámetros

    }
}
