using System.ComponentModel.DataAnnotations;

namespace OrigamiBack.Data.Dtos
{
    public class CondicionProductoDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(50, ErrorMessage = "El nombre no puede exceder 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "La descripción no puede exceder 200 caracteres")]
        public string? Descripcion { get; set; }

        public int Orden { get; set; } = 0;

        public bool Activo { get; set; } = true;
    }

    public class CrearCondicionDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(50, ErrorMessage = "El nombre no puede exceder 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "La descripción no puede exceder 200 caracteres")]
        public string? Descripcion { get; set; }

        public int Orden { get; set; } = 0;

        public bool Activo { get; set; } = true;
    }

    public class ActualizarCondicionDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(50, ErrorMessage = "El nombre no puede exceder 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "La descripción no puede exceder 200 caracteres")]
        public string? Descripcion { get; set; }

        public int Orden { get; set; } = 0;

        public bool Activo { get; set; } = true;
    }
}

