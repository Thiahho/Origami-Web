using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrigamiBack.Migrations
{
    /// <inheritdoc />
    public partial class AddProductosTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "categorias",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Icon = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categorias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "celulares",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    marca = table.Column<string>(type: "text", nullable: true),
                    modelo = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_celulares", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "condiciones_producto",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    orden = table.Column<int>(type: "integer", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_condiciones_producto", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "marcas",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_marcas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "productos",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    marca = table.Column<string>(type: "text", nullable: false),
                    modelo = table.Column<string>(type: "text", nullable: false),
                    categoria = table.Column<string>(type: "text", nullable: false),
                    estado = table.Column<string>(type: "text", nullable: false),
                    img = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_productos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: false),
                    ClaveHash = table.Column<string>(type: "text", nullable: false),
                    Rol = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "productos_variantes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductoId = table.Column<int>(type: "integer", nullable: false),
                    stock = table.Column<int>(type: "integer", nullable: false),
                    color = table.Column<string>(type: "text", nullable: true),
                    ram = table.Column<string>(type: "text", nullable: true),
                    almacenamiento = table.Column<string>(type: "text", nullable: true),
                    precio = table.Column<decimal>(type: "numeric", nullable: false),
                    imagen = table.Column<byte[]>(type: "bytea", nullable: true),
                    condicion_id = table.Column<int>(type: "integer", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_productos_variantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_productos_variantes_condiciones_producto_condicion_id",
                        column: x => x.condicion_id,
                        principalSchema: "public",
                        principalTable: "condiciones_producto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_productos_variantes_productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "public",
                        principalTable: "productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_productos_variantes_condicion_id",
                schema: "public",
                table: "productos_variantes",
                column: "condicion_id");

            migrationBuilder.CreateIndex(
                name: "IX_productos_variantes_ProductoId",
                schema: "public",
                table: "productos_variantes",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "categorias",
                schema: "public");

            migrationBuilder.DropTable(
                name: "celulares",
                schema: "public");

            migrationBuilder.DropTable(
                name: "marcas",
                schema: "public");

            migrationBuilder.DropTable(
                name: "productos_variantes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "usuarios",
                schema: "public");

            migrationBuilder.DropTable(
                name: "condiciones_producto",
                schema: "public");

            migrationBuilder.DropTable(
                name: "productos",
                schema: "public");
        }
    }
}
