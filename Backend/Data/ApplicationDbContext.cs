using OrigamiBack.Data.Modelos;
using OrigamiBack.Data.Vistas;
using Microsoft.EntityFrameworkCore;

namespace OrigamiBack.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
             : base(options) { }

        public DbSet<Celular> Celulares { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Productos> Productos { get; set; }
        public DbSet<Categorias> Categorias { get; set; }
        public DbSet<Marcas> Marcas { get; set; }
        public DbSet<ProductosVariantes> ProductosVariantes { get; set; }
        public DbSet<CondicionProducto> CondicionProductos { get; set; }
        /// VISTAS

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Usuario>()
                .ToTable("usuarios")
                .HasKey(x => x.Id);

            modelBuilder.Entity<Celular>()
                .ToTable("celulares")
                .HasKey(e => e.id);

          modelBuilder.Entity<Categorias>()
                .ToTable("categorias")
                .HasKey(p => p.Id);

            modelBuilder.Entity<Marcas>()
                .ToTable("marcas")
                .HasKey(p => p.Id);

            modelBuilder.Entity<Productos>()
                .ToTable("productos")
                .HasKey(p => p.Id);

            modelBuilder.Entity<CondicionProducto>(e=>{
                e.ToTable("condiciones_producto");
                e.HasKey(p => p.Id);
                e.Property(p=>p.Id).HasColumnName("id");
                e.Property(p=>p.Nombre).HasColumnName("nombre");
                e.Property(p=>p.Descripcion).HasColumnName("descripcion");
                e.Property(p=>p.Orden).HasColumnName("orden");
                e.Property(p=>p.Activo).HasColumnName("activo");
                e.Property(p=>p.CreatedAt).HasColumnName("created_at");
            });
            modelBuilder.Entity<CondicionProducto>()
            .HasMany(p=>p.Variantes)
            .WithOne(v=>v.Condicion)
            .HasForeignKey(v=>v.CondicionId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Productos>()
                .HasMany(p => p.Variantes)
                .WithOne(v => v.Producto)
                .HasForeignKey(v => v.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<ProductosVariantes>(e=>{
                e.ToTable("productos_variantes");
                e.HasKey(v => v.Id);
                e.Property(v=>v.Id).HasColumnName("Id");
                e.Property(v=>v.ProductoId).HasColumnName("ProductoId");
                //e.Property(v=>v.Ram).HasColumnName("ram");
                e.Property(v=>v.Almacenamiento).HasColumnName("almacenamiento");
                e.Property(v=>v.Color).HasColumnName("color");
                e.Property(v=>v.Precio).HasColumnName("precio");
                e.Property(v=>v.Stock).HasColumnName("stock");
                e.Property(v=>v.CondicionId).HasColumnName("condicion_id");
                e.HasOne(v=>v.Condicion)
                .WithMany(c=>c.Variantes)
                .HasForeignKey(v=>v.CondicionId)
                .OnDelete(DeleteBehavior.Cascade);
            });
                
        
          
        }
    }
}
