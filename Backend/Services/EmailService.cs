using OrigamiBack.Data.Dtos;
using OrigamiBack.Services.Interface;
using System.Net.Http;
using System.Text.Json;
using System.Net;
using System.Net.Mail;

namespace OrigamiBack.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public EmailService(
            IConfiguration configuration,
            ILogger<EmailService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> EnviarEmailContactoAsync(ContactoDto contacto, string ipAddress)
        {
            try
            {
                // Configuración SMTP desde variables de entorno
                var smtpHost = _configuration["SMTP_HOST"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_configuration["SMTP_PORT"] ?? "587");
                var smtpUser = _configuration["SMTP_USER"] ?? "";
                var smtpPassword = _configuration["SMTP_PASSWORD"] ?? "";
                var emailDestino = _configuration["EMAIL_DESTINO"] ?? "origami.importadosok@gmail.com";

                if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPassword))
                {
                    _logger.LogWarning("SMTP no configurado. Revisa las variables de entorno SMTP_USER y SMTP_PASSWORD");
                    return false;
                }

                // Construir el email
                using var message = new MailMessage();
                message.From = new MailAddress(smtpUser, "Formulario Origami");
                message.To.Add(emailDestino);
                message.ReplyToList.Add(new MailAddress(contacto.Email, contacto.Name));
                message.Subject = $"Contacto web: {contacto.Name}";
                message.IsBodyHtml = true;

                // Body del email con formato HTML
                message.Body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }}
        .header {{ background: #667eea; color: white; padding: 20px; text-align: center; }}
        .content {{ background: white; padding: 20px; margin-top: 20px; }}
        .field {{ margin-bottom: 15px; }}
        .field strong {{ color: #667eea; }}
        .message {{ background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin-top: 15px; }}
        .footer {{ margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📧 Nuevo Mensaje de Contacto</h1>
        </div>
        <div class='content'>
            <div class='field'>
                <strong>Nombre:</strong> {WebUtility.HtmlEncode(contacto.Name)}
            </div>
            <div class='field'>
                <strong>Email:</strong> <a href='mailto:{WebUtility.HtmlEncode(contacto.Email)}'>{WebUtility.HtmlEncode(contacto.Email)}</a>
            </div>
            <div class='field'>
                <strong>Fecha:</strong> {DateTime.Now:dd/MM/yyyy HH:mm:ss}
            </div>
            <div class='field'>
                <strong>IP:</strong> {WebUtility.HtmlEncode(ipAddress)}
            </div>
            <div class='message'>
                <strong>Mensaje:</strong><br/><br/>
                {WebUtility.HtmlEncode(contacto.Message).Replace("\n", "<br/>")}
            </div>
        </div>
        <div class='footer'>
            Este mensaje fue enviado desde el formulario de contacto de Origami<br/>
            Para responder, usa el botón 'Responder' de tu cliente de email
        </div>
    </div>
</body>
</html>";

                // Configurar SMTP client
                using var smtpClient = new SmtpClient(smtpHost, smtpPort);
                smtpClient.EnableSsl = true;
                smtpClient.Credentials = new NetworkCredential(smtpUser, smtpPassword);
                smtpClient.Timeout = 10000; // 10 segundos

                // Enviar email
                await smtpClient.SendMailAsync(message);

                _logger.LogInformation($"Email de contacto enviado exitosamente desde {contacto.Email}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al enviar email de contacto: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> VerificarTurnstileAsync(string token, string ipAddress)
        {
            try
            {
                var secretKey = _configuration["TURNSTILE_SECRET_KEY"];

                if (string.IsNullOrEmpty(secretKey))
                {
                    _logger.LogWarning("Turnstile no configurado. Revisa TURNSTILE_SECRET_KEY");
                    // En desarrollo, permitir sin CAPTCHA (SOLO PARA TESTING)
                    if (_configuration["ASPNETCORE_ENVIRONMENT"] == "Development")
                    {
                        _logger.LogWarning("⚠️ MODO DESARROLLO: Turnstile deshabilitado");
                        return true;
                    }
                    return false;
                }

                // Llamar a la API de Cloudflare Turnstile
                var httpClient = _httpClientFactory.CreateClient();
                var request = new Dictionary<string, string>
                {
                    { "secret", secretKey },
                    { "response", token },
                    { "remoteip", ipAddress }
                };

                var response = await httpClient.PostAsync(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    new FormUrlEncodedContent(request)
                );

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error al verificar Turnstile: {response.StatusCode}");
                    return false;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<TurnstileResponse>(jsonResponse);

                if (result?.Success == true)
                {
                    _logger.LogInformation("Turnstile verificado exitosamente");
                    return true;
                }
                else
                {
                    _logger.LogWarning($"Turnstile falló: {string.Join(", ", result?.ErrorCodes ?? new string[0])}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Excepción al verificar Turnstile: {ex.Message}");
                return false;
            }
        }

        // Clase para deserializar la respuesta de Turnstile
        private class TurnstileResponse
        {
            public bool Success { get; set; }
            public string[]? ErrorCodes { get; set; }
            public DateTime? ChallengeTs { get; set; }
            public string? Hostname { get; set; }
        }
    }
}
