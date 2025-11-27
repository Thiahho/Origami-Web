using OrigamiBack.Data.Dtos;

namespace OrigamiBack.Services.Interface
{
    public interface IEmailService
    {
        /// <summary>
        /// Envía un email de contacto desde el formulario web
        /// </summary>
        /// <param name="contacto">Datos del formulario de contacto</param>
        /// <param name="ipAddress">IP del cliente (para logging)</param>
        /// <returns>True si se envió correctamente</returns>
        Task<bool> EnviarEmailContactoAsync(ContactoDto contacto, string ipAddress);

        /// <summary>
        /// Verifica el token de Cloudflare Turnstile
        /// </summary>
        /// <param name="token">Token del CAPTCHA</param>
        /// <param name="ipAddress">IP del cliente</param>
        /// <returns>True si el CAPTCHA es válido</returns>
        Task<bool> VerificarTurnstileAsync(string token, string ipAddress);
    }
}
