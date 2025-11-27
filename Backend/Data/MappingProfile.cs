using AutoMapper;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Data.Dtos;

namespace OrigamiBack.Data
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Productos, ProductoDto>().ReverseMap();

            CreateMap<ProductosVariantes, ProductosVariantesDto>()
                .ForMember(dest => dest.Producto, opt => opt.Ignore());
            CreateMap<ProductosVariantesDto, ProductosVariantes>()
                .ForMember(dest => dest.Condicion, opt => opt.Ignore())
                .ForMember(dest => dest.Producto, opt => opt.Ignore());

            CreateMap<ProductoDto, Productos>()
                .ForMember(dest => dest.Img, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.Img) ? null : Convert.FromBase64String(src.Img)));

            CreateMap<Productos, ProductoDto>()
                .ForMember(dest => dest.Img, opt => opt.MapFrom(src =>
                    src.Img != null ? Convert.ToBase64String(src.Img) : null));

            CreateMap<Marcas, MarcaDto>().ReverseMap();
            CreateMap<Categorias, CategoriaDto>().ReverseMap();
        }
    }
}
