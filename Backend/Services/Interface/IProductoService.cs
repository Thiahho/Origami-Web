using System.Threading.Tasks;
using OrigamiBack.Data.Dtos;

namespace OrigamiBack.Services.Interface
{
    public interface IProductoService
    {
        Task<IEnumerable<ProductoDto>> GetAllVariantesAsync();
        Task<ProductoDto?> GetByIdWithVarianteAsync(int id);
        Task<ProductoDto> AddAsync(ProductoDto productos);
        Task<ProductosVariantesDto> AddVarianteAsync(ProductosVariantesDto productosVariantes);
        Task UpdateAsync(ProductoDto productos);
        Task DeleteAsync(int id);
        Task<IEnumerable<ProductosVariantesDto>> GetVariantesByIdAsync(int productId);
        Task<IEnumerable<ProductosVariantesDto>> GetAllVariantesByIdAsync(int productId); // Admin: obtiene todas sin filtrar
        // Modificado: Ya no se busca por RAM
        Task<ProductosVariantesDto?> GetVarianteSpecAsync(int productId, string storage, string color, int? condicionId);
        Task<ProductosVariantesDto?> GetVarianteByIdAsync(int varianteId);
        Task<ProductosVariantesDto?> GetVarianteByIdAdminAsync(int varianteId); // Sin filtrar por estado activo
        // COMENTADO: Ya no se selecciona por RAM
        // Task<IEnumerable<string>> GetDistintAlmacenamientosAsync(string ram, int productId);
        // Task<IEnumerable<string>> GetDistintColorAsync(string ram, string almacenamiento, int productId);
        Task<IEnumerable<ProductoDto>> GetAllProductsAsync();

        // Nuevos métodos
        Task UpdateVarianteAsync(ProductosVariantesDto variante);
        Task DeleteVarianteAsync(int varianteId);
        // Modificado: Ya no se valida por RAM
        Task<bool> ExistsVarianteAsync(int productoId, string almacenamiento, string color, int? condicionId);
        Task<bool> ExistsProductoAsync(string marca, string modelo);
    }
}
