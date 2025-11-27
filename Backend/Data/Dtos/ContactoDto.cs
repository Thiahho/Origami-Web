using System.ComponentModel.DataAnnotations;

namespace OrigamiBack.Data.Dtos
{
    public class ContactoDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El email no es válido")]
        [StringLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "El mensaje es requerido")]
        [StringLength(2000, MinimumLength = 20, ErrorMessage = "El mensaje debe tener entre 20 y 2000 caracteres")]
        public string Message { get; set; } = string.Empty;

        // Campo honeypot - debe estar vacío (los humanos no lo ven, solo los bots lo llenan)
        public string? Website { get; set; }

        // Token de Cloudflare Turnstile para verificación CAPTCHA
        [Required(ErrorMessage = "La verificación CAPTCHA es requerida")]
        public string TurnstileToken { get; set; } = string.Empty;
    }
}
