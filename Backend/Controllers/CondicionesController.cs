using OrigamiBack.Data;
using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace OrigamiBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CondicionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CondicionesController> _logger;

        public CondicionesController(ApplicationDbContext context, ILogger<CondicionesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las condiciones (público)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CondicionProductoDto>>> GetAll()
        {
            try
            {
                var condiciones = await _context.CondicionProductos
                    .OrderBy(c => c.Orden)
                    .ToListAsync();

                var dtos = condiciones.Select(c => new CondicionProductoDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    Orden = c.Orden,
                    Activo = c.Activo
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener condiciones");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtener solo condiciones activas (público - para selectores)
        /// </summary>
        [HttpGet("activas")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CondicionProductoDto>>> GetActivas()
        {
            try
            {
                var condiciones = await _context.CondicionProductos
                    .Where(c => c.Activo)
                    .OrderBy(c => c.Orden)
                    .ToListAsync();

                var dtos = condiciones.Select(c => new CondicionProductoDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    Orden = c.Orden,
                    Activo = c.Activo
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener condiciones activas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtener una condición por ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionProductoDto>> GetById(int id)
        {
            try
            {
                var condicion = await _context.CondicionProductos.FindAsync(id);

                if (condicion == null)
                    return NotFound($"No se encontró la condición con ID {id}");

                var dto = new CondicionProductoDto
                {
                    Id = condicion.Id,
                    Nombre = condicion.Nombre,
                    Descripcion = condicion.Descripcion,
                    Orden = condicion.Orden,
                    Activo = condicion.Activo
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener la condición {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crear una nueva condición (solo admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<CondicionProductoDto>> Create([FromBody] CrearCondicionDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verificar si ya existe una condición con el mismo nombre
                var existente = await _context.CondicionProductos
                    .AnyAsync(c => c.Nombre.ToLower() == dto.Nombre.ToLower());

                if (existente)
                    return BadRequest(new { message = "Ya existe una condición con ese nombre" });

                var nuevaCondicion = new CondicionProducto
                {
                    Nombre = dto.Nombre,
                    Descripcion = dto.Descripcion,
                    Orden = dto.Orden,
                    Activo = dto.Activo,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CondicionProductos.Add(nuevaCondicion);
                await _context.SaveChangesAsync();

                var resultado = new CondicionProductoDto
                {
                    Id = nuevaCondicion.Id,
                    Nombre = nuevaCondicion.Nombre,
                    Descripcion = nuevaCondicion.Descripcion,
                    Orden = nuevaCondicion.Orden,
                    Activo = nuevaCondicion.Activo
                };

                return CreatedAtAction(nameof(GetById), new { id = resultado.Id }, resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la condición");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualizar una condición (solo admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] ActualizarCondicionDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var condicion = await _context.CondicionProductos.FindAsync(id);

                if (condicion == null)
                    return NotFound($"No se encontró la condición con ID {id}");

                // Verificar si el nuevo nombre ya existe en otra condición
                var existente = await _context.CondicionProductos
                    .AnyAsync(c => c.Nombre.ToLower() == dto.Nombre.ToLower() && c.Id != id);

                if (existente)
                    return BadRequest(new { message = "Ya existe otra condición con ese nombre" });

                condicion.Nombre = dto.Nombre;
                condicion.Descripcion = dto.Descripcion;
                condicion.Orden = dto.Orden;
                condicion.Activo = dto.Activo;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Condición actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar la condición {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Eliminar una condición (solo admin)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var condicion = await _context.CondicionProductos.FindAsync(id);

                if (condicion == null)
                    return NotFound($"No se encontró la condición con ID {id}");

                // Verificar si hay variantes usando esta condición
                var tieneVariantes = await _context.ProductosVariantes
                    .AnyAsync(v => v.CondicionId == id);

                if (tieneVariantes)
                {
                    return BadRequest(new 
                    { 
                        message = "No se puede eliminar esta condición porque hay productos que la están usando. Desactívala en su lugar." 
                    });
                }

                _context.CondicionProductos.Remove(condicion);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Condición eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar la condición {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Cambiar el estado activo/inactivo de una condición (solo admin)
        /// </summary>
        [HttpPatch("{id}/toggle-activo")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ToggleActivo(int id)
        {
            try
            {
                var condicion = await _context.CondicionProductos.FindAsync(id);

                if (condicion == null)
                    return NotFound($"No se encontró la condición con ID {id}");

                condicion.Activo = !condicion.Activo;
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Condición {(condicion.Activo ? "activada" : "desactivada")} exitosamente", activo = condicion.Activo });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al cambiar estado de la condición {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}

