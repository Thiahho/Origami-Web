using Humanizer;

namespace OrigamiBack.Data.Vistas
{
    public class VProductosConVariantes
    {

        public string Marca { get; set;} = string.Empty;
        public string Modelo { get; set;} = string.Empty;
        public string Color { get; set;} = string.Empty;
        public int PrecioModelo { get; set;} = 0;
        public string Almacenamiento { get; set;} = string.Empty;
        public int Condicion { get; set;}
        public bool Activo { get; set;} = true;

    }
}