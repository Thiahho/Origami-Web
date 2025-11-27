using OrigamiBack.Data.Dtos;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace OrigamiBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactoController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactoController> _logger;

        public ContactoController(IEmailService emailService, ILogger<ContactoController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost]
        [EnableRateLimiting("ContactPolicy")]
        public async Task<IActionResult> EnviarContacto([FromBody] ContactoDto contacto)
        {
            try
            {
                // 1. Validar ModelState
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Formulario de contacto con datos inválidos");
                    return BadRequest(new { message = "Datos inválidos" });
                }

                // 2. HONEYPOT: Si el campo 'website' tiene contenido, es un bot
                if (!string.IsNullOrWhiteSpace(contacto.Website))
                {
                    _logger.LogWarning($"Bot detectado por honeypot desde IP {GetClientIp()}");
                    // Devolver 200 OK para no dar pistas al bot de que lo detectamos
                    return Ok(new { message = "Mensaje enviado" });
                }

                // 3. Obtener IP del cliente
                var ipAddress = GetClientIp();

                // 4. Verificar CAPTCHA (Cloudflare Turnstile)
                var captchaValido = await _emailService.VerificarTurnstileAsync(contacto.TurnstileToken, ipAddress);
                if (!captchaValido)
                {
                    _logger.LogWarning($"CAPTCHA inválido desde IP {ipAddress}");
                    return StatusCode(429, new { message = "Verificación CAPTCHA fallida. Por favor, intenta nuevamente." });
                }

                // 5. Enviar el email
                var emailEnviado = await _emailService.EnviarEmailContactoAsync(contacto, ipAddress);

                if (!emailEnviado)
                {
                    _logger.LogError($"Error al enviar email de contacto desde {contacto.Email}");
                    return StatusCode(503, new { message = "Error temporal al procesar tu mensaje. Por favor, intenta más tarde o contáctanos por WhatsApp." });
                }

                // 6. Éxito
                _logger.LogInformation($"✅ Mensaje de contacto procesado exitosamente desde {contacto.Email} ({ipAddress})");
                return Ok(new { message = "Mensaje enviado exitosamente. Te responderemos pronto." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Excepción al procesar contacto: {ex.Message}");
                return StatusCode(500, new { message = "Error al procesar tu mensaje. Por favor, intenta más tarde." });
            }
        }

        /// <summary>
        /// Obtiene la IP real del cliente (considerando proxies y balanceadores)
        /// </summary>
        private string GetClientIp()
        {
            // Intentar obtener la IP desde headers de proxy/load balancer
            var xForwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xForwardedFor))
            {
                var ips = xForwardedFor.Split(',');
                return ips[0].Trim(); // Tomar la primera IP (cliente original)
            }

            var xRealIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xRealIp))
            {
                return xRealIp.Trim();
            }

            // Fallback a la IP directa de la conexión
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        }
    }
}
