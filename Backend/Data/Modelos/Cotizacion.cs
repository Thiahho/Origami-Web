// using System.ComponentModel.DataAnnotations;
// using System.ComponentModel.DataAnnotations.Schema;

// namespace OrigamiBack.Data.Modelos
// {
//     [Table("Cotizaciones")]
//     public class Cotizacion
//     {
//         [Key]
//         public int Id { get; set; }

//         [Required]
//         [StringLength(10)]
//         public string Moneda { get; set; } = "USD";

//         [Required]
//         [Column(TypeName = "decimal(18,2)")]
//         public decimal Valor { get; set; }

//         [Required]
//         public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

//         public bool EsActiva { get; set; } = true;

//         [StringLength(100)]
//         public string? CreadoPor { get; set; }

//         public string? Notas { get; set; }
//     }
// }
