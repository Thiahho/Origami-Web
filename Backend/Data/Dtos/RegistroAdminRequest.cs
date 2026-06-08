using System.ComponentModel.DataAnnotations;

namespace OrigamiBack.Data.Dtos
{
    public class RegistroAdminRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string BootstrapKey { get; set; } = string.Empty;
    }
}
