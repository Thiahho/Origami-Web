using OrigamiBack.Data;
using OrigamiBack.Data.Dtos;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;

namespace OrigamiBack.Controllers
{
    /// <summary>Gestión de productos y sus variantes.</summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;
        private readonly ILogger<ProductoController> _logger;

        public ProductoController(IProductoService productoService, ILogger<ProductoController> logger)
        {
            _productoService = productoService;
            _logger = logger;
        }

        /// <summary>Obtiene todos los productos.</summary>
        /// <returns>Lista de productos.</returns>
        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetAll()
        {
            try
            {
                var productos = await _productoService.GetAllProductsAsync();
                return Ok(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los productos");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Obtiene solo los productos activos.</summary>
        [AllowAnonymous]
        [HttpGet("activos")]
        [ProducesResponseType(typeof(IEnumerable<ProductoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetActivos()
        {
            try
            {
                var productos = await _productoService.GetAllProductsAsync();
                var activos = productos.Where(p => p.Estado == "active").ToList();
                return Ok(activos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos activos");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Obtiene productos paginados.</summary>
        /// <param name="page">Número de página (mínimo 1).</param>
        /// <param name="pageSize">Elementos por página (1-100, default 20).</param>
        /// <param name="soloActivos">Si es true, filtra solo productos activos.</param>
        [AllowAnonymous]
        [HttpGet("paged")]
        [ProducesResponseType(typeof(PagedResult<ProductoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedResult<ProductoDto>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] bool soloActivos = false)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            try
            {
                var all = await _productoService.GetAllProductsAsync();

                // Filtrar solo activos si se solicita
                if (soloActivos)
                {
                    all = all.Where(p => p.Estado == "active");
                }

                var total = all.Count();
                var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                var result = new PagedResult<ProductoDto>
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    TotalItems = total
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos paginados");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Obtiene un producto por ID incluyendo sus variantes.</summary>
        /// <param name="id">ID del producto.</param>
        [AllowAnonymous]
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ProductoDto>> GetById(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(id);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {id}");
                }
                return Ok(producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Obtiene las variantes activas de un producto.</summary>
        /// <param name="productoId">ID del producto.</param>
        [AllowAnonymous]
        [HttpGet("{productoId}/variantes")]
        [ProducesResponseType(typeof(IEnumerable<ProductosVariantesDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ProductosVariantesDto>>> GetVariantesAsync(int productoId)
        {
            try
            {
                var variantes = await _productoService.GetVariantesByIdAsync(productoId);
                // Siempre devolver un array, incluso si está vacío
                return Ok(variantes ?? new List<ProductosVariantesDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener variantes para el producto {productoId}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>Obtiene todas las variantes de un producto (activas e inactivas). Requiere ADMIN.</summary>
        /// <param name="productoId">ID del producto.</param>
        [Authorize(Roles = "ADMIN")]
        [HttpGet("{productoId}/variantes/admin")]
        [ProducesResponseType(typeof(IEnumerable<ProductosVariantesDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<IEnumerable<ProductosVariantesDto>>> GetAllVariantesAdminAsync(int productoId)
        {
            try
            {
                // Admin: obtiene TODAS las variantes (activas e inactivas)
                var variantes = await _productoService.GetAllVariantesByIdAsync(productoId);
                return Ok(variantes ?? new List<ProductosVariantesDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener todas las variantes para el producto {productoId}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // COMENTADO: Ya no se selecciona por RAM
        // [AllowAnonymous]
        // [HttpGet("{productoId}/Ram-Opciones")]
        // public async Task<ActionResult<IEnumerable<string>>> GetDistinctRamAsync(int productoId)
        // {
        //     try
        //     {
        //         var producto = await _productoService.GetByIdWithVarianteAsync(productoId);
        //         if (producto == null)
        //         {
        //             return NotFound($"No se encontró el producto con ID {productoId}");
        //         }
        //         var opciones = producto.GetAvailableRAM();
        //         return Ok(opciones);
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        //     }
        // }

        /// <summary>Obtiene las opciones de almacenamiento disponibles para un producto.</summary>
        /// <param name="productoId">ID del producto.</param>
        [AllowAnonymous]
        [HttpGet("{productoId}/Almacenamiento-Opciones")]
        [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctAlmacenamientosAsync(int productoId)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                // Ya no se filtra por RAM
                var almacenamientos = producto.GetAvailableStorage();
                return Ok(almacenamientos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>Obtiene los colores disponibles para un producto filtrados por almacenamiento.</summary>
        /// <param name="productoId">ID del producto.</param>
        /// <param name="almacenamiento">Almacenamiento seleccionado (ej: "256GB").</param>
        [AllowAnonymous]
        [HttpGet("{productoId}/Color-Opciones")]
        [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<string>>> GetDistinctColorsAsync(int productoId, [FromQuery] string almacenamiento)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(productoId);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {productoId}");
                }
                // Ya no se filtra por RAM, solo por almacenamiento
                var colores = producto.GetAvailableColors(almacenamiento);
                return Ok(colores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>Busca una variante específica por almacenamiento, color y condición.</summary>
        /// <param name="productId">ID del producto.</param>
        /// <param name="storage">Almacenamiento (ej: "256GB").</param>
        /// <param name="color">Color (ej: "Black").</param>
        /// <param name="condicionId">ID de la condición (opcional).</param>
        [AllowAnonymous]
        [HttpGet("{productId}/variante")]
        [ProducesResponseType(typeof(ProductosVariantesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProductosVariantesDto>> GetVarianteSpecAsync(
            int productId,
            [FromQuery] string storage,
            [FromQuery] string color,
            [FromQuery] int? condicionId)
        {
            try
            {
                // Ya no se busca por RAM, solo por storage y color
                var variante = await _productoService.GetVarianteSpecAsync(productId, storage, color, condicionId);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con las especificaciones solicitadas");
                }
                return Ok(variante);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>Crea un nuevo producto. Requiere ADMIN.</summary>
        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        // [EnableRateLimiting("CriticalPolicy")] // Deshabilitado
        public async Task<ActionResult<ProductoDto>> Create([FromBody] ProductoDto producto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nuevoProducto = await _productoService.AddAsync(producto);
                return CreatedAtAction(nameof(GetById), new { id = nuevoProducto.Id }, nuevoProducto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el producto");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Actualiza un producto existente. Requiere ADMIN.</summary>
        /// <param name="id">ID del producto a actualizar.</param>
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update(int id, [FromBody] ProductoDto productoDto)
        {
            try
            {
                if (id != productoDto.Id)
                    return BadRequest("El ID del producto no coincide");

                // Obtener el producto existente
                var existingProducto = await _productoService.GetByIdWithVarianteAsync(id);
                if (existingProducto == null)
                    return NotFound($"No se encontró el producto con ID {id}");

                // Si no se proporciona una nueva imagen, mantener la existente
                if (string.IsNullOrEmpty(productoDto.Img))
                    productoDto.Img = existingProducto.Img;

                await _productoService.UpdateAsync(productoDto);
                return Ok(productoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Elimina un producto. Requiere ADMIN.</summary>
        /// <param name="id">ID del producto a eliminar.</param>
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        // [EnableRateLimiting("CriticalPolicy")] // Deshabilitado
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var producto = await _productoService.GetByIdWithVarianteAsync(id);
                if (producto == null)
                {
                    return NotFound($"No se encontró el producto con ID {id}");
                }

                await _productoService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el producto {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Obtiene una variante por su ID.</summary>
        /// <param name="id">ID de la variante.</param>
        [HttpGet("variante/{id}")]
        [ProducesResponseType(typeof(ProductosVariantesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProductosVariantesDto>> GetVarianteById(int id)
        {
            try
            {
                var variante = await _productoService.GetVarianteByIdAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }
                return Ok(variante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Crea una nueva variante para un producto. Requiere ADMIN.</summary>
        [HttpPost("variante")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ProductosVariantesDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateVariante([FromBody] ProductosVariantesDto varianteDto)
        {
            try
            {
                // COMENTADO: Validación de duplicados deshabilitada temporalmente
                // Como ya no usamos RAM, pueden existir múltiples variantes con mismo Storage+Color
                // pero diferente RAM (datos legacy)
                /*
                var existingVariante = await _productoService.GetVarianteSpecAsync(
                    varianteDto.ProductoId,
                    varianteDto.Almacenamiento,
                    varianteDto.Color,
                    varianteDto.CondicionId
                );

                if (existingVariante != null)
                {
                    return BadRequest("Ya existe una variante con estas especificaciones");
                }
                */

                // Crear la nueva variante
                var createdVariante = await _productoService.AddVarianteAsync(varianteDto);
                return CreatedAtAction(nameof(GetVarianteById), new { id = createdVariante.Id }, createdVariante);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la variante");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Actualiza una variante existente. Requiere ADMIN.</summary>
        /// <param name="varianteId">ID de la variante a actualizar.</param>
        [HttpPut("variante/{varianteId}")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ProductosVariantesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateVariante(int varianteId, [FromBody] ProductosVariantesDto varianteDto)
        {
            // 1. Buscar la variante existente (incluso si está inactiva)
            var existingVariante = await _productoService.GetVarianteByIdAdminAsync(varianteId);
            if (existingVariante == null)
                return NotFound($"No se encontró la variante con ID {varianteId}");

            // 2. COMENTADO: Validación de duplicados deshabilitada temporalmente
            // Como ya no usamos RAM, pueden existir múltiples variantes con mismo Storage+Color
            // pero diferente RAM (datos legacy)
            /*
            var duplicateCheck = await _productoService.GetVarianteSpecAsync(
                existingVariante.ProductoId,
                varianteDto.Almacenamiento,
                varianteDto.Color,
                varianteDto.CondicionId
            );
            if (duplicateCheck != null && duplicateCheck.Id != varianteId)
                return BadRequest("Ya existe una variante con estas especificaciones");
            */

            // 3. Asignar los IDs correctos al DTO
            varianteDto.Id = varianteId;
            varianteDto.ProductoId = existingVariante.ProductoId;

            // 4. Actualizar la variante (solo update, nunca delete)
            await _productoService.UpdateVarianteAsync(varianteDto);

            // 5. Devolver la variante actualizada
            return Ok(varianteDto);
        }

        /// <summary>Elimina una variante. Requiere ADMIN.</summary>
        /// <param name="id">ID de la variante a eliminar.</param>
        [HttpDelete("variante/{id}")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteVariante(int id)
        {
            try
            {
                // Usar método admin para eliminar variantes incluso si están inactivas
                var variante = await _productoService.GetVarianteByIdAdminAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }

                await _productoService.DeleteVarianteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>Activa o desactiva una variante. Requiere ADMIN.</summary>
        /// <param name="id">ID de la variante.</param>
        /// <param name="activo">true para activar, false para desactivar.</param>
        [HttpPatch("variante/{id}/toggle-activo")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ToggleVarianteActivo(int id, [FromBody] bool activo)
        {
            try
            {
                // Usar método admin para obtener variantes incluso si están inactivas
                var variante = await _productoService.GetVarianteByIdAdminAsync(id);
                if (variante == null)
                {
                    return NotFound($"No se encontró la variante con ID {id}");
                }

                variante.Activo = activo;
                await _productoService.UpdateVarianteAsync(variante);

                return Ok(new {
                    message = activo ? "Variante activada correctamente" : "Variante desactivada correctamente",
                    activo = activo
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al cambiar el estado de la variante {id}");
                return StatusCode(500, "Error interno del servidor");
            }

            
        }

        [HttpGet("con-variantes")]
        public async Task<IActionResult> GetVPCV([FromBody] bool? activo)
        {
            var data = await _productoService.GetVProductosConVariantesAsync(activo);
            return Ok(data);
        }

    }
}
