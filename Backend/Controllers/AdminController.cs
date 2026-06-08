using OrigamiBack.Data;
using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Services;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.RateLimiting;
using OrigamiBack.Middleware;
namespace OrigamiBack.Controllers
{
    /// <summary>Autenticación y gestión de administradores.</summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUsuarioService _usuarioService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(ApplicationDbContext context, IConfiguration config, IUsuarioService usuarioService, ILogger<AdminController> logger)
        {
            _context = context;
            _configuration = config;
            _usuarioService = usuarioService;
            _logger = logger;
        }

        /// <summary>Crea un nuevo usuario administrador.</summary>
        [HttpPost("registro")]
        [AllowAnonymous]
        [EnableRateLimiting("AuthPolicy")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CrearAdmin([FromBody] RegistroAdminRequest request)
        {
            try
            {
                // Verificar clave de bootstrap
                var bootstrapKey = _configuration["ADMIN_BOOTSTRAP_KEY"]
                    ?? Environment.GetEnvironmentVariable("ADMIN_BOOTSTRAP_KEY");

                if (string.IsNullOrEmpty(bootstrapKey))
                    return StatusCode(403, new { message = "Registro de administradores no habilitado" });

                if (request.BootstrapKey != bootstrapKey)
                    return StatusCode(403, new { message = "Clave de bootstrap inválida" });

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Email y contraseña son requeridos" });
                }

                var usuario = new Usuario { Email = request.Email, ClaveHash = request.Password };
                usuario.Rol = "ADMIN";
                var usuarioCreado = await _usuarioService.CrearUsuarioAsync(usuario);

                return Ok(new
                {
                    message = "Administrador creado correctamente",
                    usuario = new
                    {
                        id = usuarioCreado.Id,
                        email = usuarioCreado.Email,
                        rol = usuarioCreado.Rol
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el administrador");
                return StatusCode(500, new { message = "Error al crear el administrador" });
            }
        }

        /// <summary>Inicia sesión como administrador. Devuelve una cookie HttpOnly con el JWT.</summary>
        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting("AuthPolicy")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] Auth auth)
        {
            try
            {
                if (string.IsNullOrEmpty(auth.Email) || string.IsNullOrEmpty(auth.Password))
                {
                    return BadRequest("Email y contraseña son requeridos");
                }

                var usuario = await _usuarioService.ValidarCredencialesAsync(auth.Email, auth.Password);
                
                if (usuario == null)
                {
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }

                if (usuario.Rol?.ToUpper() != "ADMIN")
                {
                    return Unauthorized(new { message = "No tienes permisos de administrador" });
                }

                var token = _usuarioService.GenerarToken(usuario);

                // Configurar cookie de sesión (se elimina al cerrar el navegador)
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    // Sin MaxAge ni Expires = cookie de sesión que se borra al cerrar navegador
                    Path = "/",
                    IsEssential = true
                };

                // En producción, usar configuración más segura
                if (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production")
                {
                    cookieOptions.Secure = true;
                    // IMPORTANTE: None + Secure permite cookies cross-site (Vercel → Render)
                    // Lax NO funciona correctamente entre dominios diferentes
                    cookieOptions.SameSite = SameSiteMode.None;
                }

                Response.Cookies.Append("AuthToken", token, cookieOptions);

                _logger.LogInformation("Login exitoso para {Email}", usuario.Email);

                return Ok(new
                {
                    message = "Inicio de sesión exitoso",
                    usuario = new
                    {
                        id = usuario.Id,
                        email = usuario.Email,
                        rol = usuario.Rol
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al iniciar sesión");
                return StatusCode(500, new { message = "Error al iniciar sesión" });
            }
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public IActionResult Logout()
        {
            try
            {
                // Eliminar cookie de autenticación
                // Coincidir Path y atributos clave para garantizar borrado en todos los navegadores
                var isProduction = _configuration["ASPNETCORE_ENVIRONMENT"] == "Production";
                Response.Cookies.Delete("AuthToken", new CookieOptions
                {
                    Path = "/",
                    SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                    Secure = isProduction
                });

                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cerrar sesión", error = ex.Message });
            }
        }

        [HttpGet("verify")]
        [AllowAnonymous]
        public IActionResult VerifySession()
        {
            try
            {
                if (Request.Cookies.TryGetValue("AuthToken", out _) && User.Identity?.IsAuthenticated == true)
                {
                    var email = User.FindFirst(ClaimTypes.Email)?.Value;
                    _logger.LogDebug("Sesión válida para {Email}", email);

                    return Ok(new
                    {
                        isAuthenticated = true,
                        usuario = new
                        {
                            id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                            email = email,
                            rol = User.FindFirst(ClaimTypes.Role)?.Value
                        }
                    });
                }

                return Ok(new { isAuthenticated = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar sesión");
                return StatusCode(500, new { message = "Error al verificar sesión" });
            }
        }

        private async Task<bool> AlreadyExist(string email)
        {
            return await _context.Usuarios.AnyAsync(u=>u.Email.ToLower()== email.ToLower());
        }

        // ============================= ENDPOINTS PROTEGIDOS =============================
      
    }
}
