using OrigamiBack.Data;
using OrigamiBack.Data.Modelos;
using OrigamiBack.Middleware;
using OrigamiBack.Services;
using OrigamiBack.Services.Interface;
using OrigamiBack.HealthChecks;
using OrigamiBack.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.Text.Json;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

try
{
    // 🔑 Permitir lectura de variables desde .env y entorno
    builder.Configuration
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
        .AddJsonFile($"appsettings.Development.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
        .AddEnvironmentVariables();

    // 🔒 OBTENER VARIABLES DE ENTORNO DE FORMA SEGURA
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
        ?? builder.Configuration.GetConnectionString("DefaultConnection");
    
    var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
        ?? builder.Configuration["JWTKey:Secret"];
    
    var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
        ?? builder.Configuration["JWTKey:ValidIssuer"];
    
    var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
        ?? builder.Configuration["JWTKey:ValidAudience"];
    
    var corsOriginsEnv = Environment.GetEnvironmentVariable("CORS_ORIGINS");
    var corsOrigins = !string.IsNullOrEmpty(corsOriginsEnv) 
        ? corsOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries)
        : builder.Configuration.GetSection("CORS:AllowedOrigins").Get<string[]>();

    // ✅ VALIDACIÓN DE VARIABLES CRÍTICAS EN PRODUCCIÓN
    if (builder.Environment.IsProduction())
    {
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("🔴 CRÍTICO: DATABASE_CONNECTION_STRING es requerida en producción");
        }
        
        if (string.IsNullOrEmpty(jwtSecret))
        {
            throw new InvalidOperationException("🔴 CRÍTICO: JWT_SECRET es requerida en producción");
        }
        
        if (string.IsNullOrEmpty(jwtIssuer))
        {
            throw new InvalidOperationException("🔴 CRÍTICO: JWT_ISSUER es requerida en producción");
        }
        
        if (string.IsNullOrEmpty(jwtAudience))
        {
            throw new InvalidOperationException("🔴 CRÍTICO: JWT_AUDIENCE es requerida en producción");
        }
        
        if (corsOrigins == null || corsOrigins.Length == 0)
        {
            throw new InvalidOperationException("🔴 CRÍTICO: CORS_ORIGINS es requerida en producción");
        }

        // Validar longitud mínima del JWT Secret en producción
        if (jwtSecret.Length < 32)
        {
            throw new InvalidOperationException("🔴 CRÍTICO: JWT_SECRET debe tener al menos 32 caracteres en producción");
        }
    }

    // 📝 Configurar Serilog desde appsettings.json
    builder.Host.UseSerilog((context, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName)
            .Enrich.WithProperty("Application", "OrigamiBack-API")
            .WriteTo.Console()
            .WriteTo.File("logs/origamiback-.log", rollingInterval: RollingInterval.Day);
    });

    // 📝 Logging temprano para debugging (SIN MOSTRAR CREDENCIALES)
   // Log.Information($"🌍 Entorno: {builder.Environment.EnvironmentName}");
   // Log.Information($"🔗 Conexión BD: {(!string.IsNullOrEmpty(connectionString) ? "✅ Configurada" : "❌ No configurada")}");
   // Log.Information($"🔑 JWT Secret: {(!string.IsNullOrEmpty(jwtSecret) ? "✅ Configurado" : "❌ No configurado")}");
   // Log.Information($"🌐 CORS Origins: {(corsOrigins?.Length > 0 ? string.Join(", ", corsOrigins) : "❌ No configurados")}");

    // 1. Configuración del DbContext
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("🔴 No se encontró la cadena de conexión");
        }
        
        options.UseNpgsql(connectionString);

        // Solo en Development
        if (builder.Environment.IsDevelopment())
        {
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
        }
    });

    // 2. Configuración de CORS dinámica
   builder.Services.AddCors(options =>
{
    var environment = builder.Environment.EnvironmentName;

    // Validar que existan orígenes configurados
    if (corsOrigins == null || corsOrigins.Length == 0)
    {
        throw new InvalidOperationException("🔴 CORS:AllowedOrigins debe estar configurado");
    }

    // Normalizar orígenes
    corsOrigins = corsOrigins
        .Select(o => o.Trim())
        .Where(o => !string.IsNullOrWhiteSpace(o))
        .ToArray();

    // Validar que los orígenes sean URLs válidas
    foreach (var origin in corsOrigins)
    {
        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        {
            throw new InvalidOperationException($"🔴 URL de origen inválida: {origin}");
        }
    }

    if (environment == "Development")
    {
        options.AddPolicy("DevCORS", policy =>
        {
            policy.WithOrigins(corsOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    }
    else
    {
        options.AddPolicy("ProductionCORS", policy =>
        {
            policy
                .WithOrigins(corsOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    }
});

    var corsPolicy = builder.Environment.IsDevelopment() ? "DevCORS" : "ProductionCORS";

    // 3. RATE LIMITING
    // 3. RATE LIMITING
builder.Services.AddRateLimiter(options =>
{
    // 🔹 Sin GlobalLimiter: no se limita todo /api por defecto

    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.PermitLimit = builder.Environment.IsDevelopment() ? 100 : 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 5;
    });

    options.AddFixedWindowLimiter("ApiPolicy", opt =>
    {
        opt.PermitLimit = builder.Environment.IsDevelopment() ? 100000 : 10000;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 1000;
    });

    options.AddFixedWindowLimiter("CriticalPolicy", opt =>
    {
        opt.PermitLimit = builder.Environment.IsDevelopment() ? 100000 : 10000;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 1000;
    });

    // Rate limiting solo para el formulario de contacto (cuando lo uses explícitamente)
    options.AddFixedWindowLimiter("ContactPolicy", opt =>
    {
        opt.PermitLimit = builder.Environment.IsDevelopment() ? 100 : 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 10;
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.Headers["Retry-After"] = "60";
        context.HttpContext.Response.Headers["X-RateLimit-Limit"] = "100";
        context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = "0";
        context.HttpContext.Response.Headers["X-RateLimit-Reset"] =
            DateTimeOffset.UtcNow.AddMinutes(1).ToUnixTimeSeconds().ToString();

        var response = new
        {
            error = "Rate limit exceeded",
            message = "Too many requests. Please try again later.",
            retryAfter = 60
        };

        await context.HttpContext.Response.WriteAsync(
            System.Text.Json.JsonSerializer.Serialize(response),
            cancellationToken: token);
    };
});


    // 4. Configuración de autenticación JWT
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();

        options.TokenValidationParameters = new TokenValidationParameters
        {
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret ?? throw new InvalidOperationException("🔴 JWT Secret no configurado")))
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers["Token-Expired"] = "true";
                }
                return Task.CompletedTask;
            }
        };
    });

    // 5. Configuración de Cookies seguras
    builder.Services.Configure<CookiePolicyOptions>(options =>
    {
        options.CheckConsentNeeded = context => true;
        // IMPORTANTE: En producción usar Unspecified para permitir que cada cookie defina su SameSite
        // Esto permite SameSite=None en cookies de autenticación para cross-site (Vercel → Render)
        options.MinimumSameSitePolicy = builder.Environment.IsDevelopment()
            ? SameSiteMode.Lax
            : SameSiteMode.Unspecified;
        options.HttpOnly = HttpOnlyPolicy.Always;
        options.Secure = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
    });

    // 6. Configuración de sesión
    builder.Services.AddDistributedMemoryCache();
    builder.Services.AddSession(options =>
    {
        options.IdleTimeout = TimeSpan.FromMinutes(30);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        // IMPORTANTE: Usar None en producción para permitir cookies cross-site (Vercel → Render)
        options.Cookie.SameSite = builder.Environment.IsDevelopment()
            ? SameSiteMode.Lax
            : SameSiteMode.None; // None + Secure permite cross-site en producción
    });

    builder.Services.AddMemoryCache();

    // 7. Servicios de la aplicación
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddAuthorization();
    builder.Services.AddAutoMapper(typeof(Program));

    // 8. Configuración de Swagger
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "OrigamiBack API",
            Version = "v1",
            Description = "API para la aplicación Origami",
            Contact = new OpenApiContact
            {
                Name = "Origami",
                Email = "info@origami.com",
            }
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[]{}
            }
        });

        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            c.IncludeXmlComments(xmlPath);
        }
        c.DocumentFilter<SwaggerSecurityFilter>();
    });

    // 9. Configuración de Health Checks
    builder.Services.AddHealthChecks()
        .AddCheck("self", () => HealthCheckResult.Healthy("API is running"))
        .AddDbContextCheck<ApplicationDbContext>("database")
        .AddCheck<MemoryHealthCheck>("memory")
        .AddCheck<DiskSpaceHealthCheck>("disk")
        .AddCheck<DatabaseConnectionHealthCheck>("database_connection");

    // 10. Inyección de dependencias personalizadas
    builder.Services.AddScoped<IUsuarioService, UsuarioService>();
    //builder.Services.AddScoped<ICelularesService, EquiposService>();
    //builder.Services.AddScoped<IvCelularesInfoService, vCelularesInfoService>();
    builder.Services.AddScoped<IProductoService, ProductosService>();
    builder.Services.AddScoped<IMarcaService, MarcasService>();
    builder.Services.AddScoped<ICategoriaService, CategoriasService>();
    builder.Services.AddScoped<IEmailService, EmailService>();

    // HttpClientFactory para llamadas HTTP (Turnstile API, etc.)
    builder.Services.AddHttpClient();

    var app = builder.Build();

    // 🔄 EJECUTAR MIGRACIONES AUTOMÁTICAMENTE AL INICIAR
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();

            Log.Information("🔍 Verificando estado de la base de datos...");

            // Aplicar migraciones pendientes (sincrónico para evitar problemas con using)
            var pendingMigrations = context.Database.GetPendingMigrations().ToList();
            if (pendingMigrations.Any())
            {
                Log.Information($"📦 Aplicando {pendingMigrations.Count} migraciones pendientes...");
                context.Database.Migrate();
                Log.Information("✅ Migraciones aplicadas exitosamente");
            }
            else
            {
                Log.Information("✅ Base de datos actualizada (no hay migraciones pendientes)");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "❌ Error al ejecutar migraciones de base de datos");
            throw; // Detener inicio si las migraciones fallan
        }
    }

    // 11. Configuración de Swagger por entorno
    var enableSwagger = builder.Configuration.GetValue<bool>("Swagger:EnabledInProduction", false);
    var swaggerPassword = Environment.GetEnvironmentVariable("SWAGGER_PASSWORD") 
        ?? builder.Configuration.GetValue<string>("Swagger:Password");

    // Logger para información de inicio
   // Log.Information($"🌍 Entorno: {app.Environment.EnvironmentName}");
   // Log.Information($"📚 Swagger habilitado: {(app.Environment.IsDevelopment() || (app.Environment.IsStaging() && enableSwagger))}");

    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "OrigamiBack API v1");
            c.RoutePrefix = "swagger";
            c.DocumentTitle = "OrigamiBack API - Development";
            c.DefaultModelsExpandDepth(-1);
            c.DocExpansion(DocExpansion.None);
        });
    }
    else if (app.Environment.IsStaging() && enableSwagger)
    {
        if (string.IsNullOrEmpty(swaggerPassword))
        {
            Log.Warning("⚠️ ADVERTENCIA: Swagger habilitado en Staging sin contraseña configurada");
        }

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "OrigamiBack API v1 - Staging");
            c.RoutePrefix = "docs";
            c.DocumentTitle = "OrigamiBack API - Staging";
            c.DefaultModelsExpandDepth(-1);
            c.DocExpansion(DocExpansion.None);
        });

        // Middleware para proteger Swagger en staging
        app.UseWhen(context => context.Request.Path.StartsWithSegments("/docs") ||
                              context.Request.Path.StartsWithSegments("/swagger"),
            appBuilder =>
            {
                appBuilder.Use(async (context, next) =>
                {
                    if (!context.Request.Headers.ContainsKey("Authorization"))
                    {
                        context.Response.StatusCode = 401;
                        context.Response.Headers["WWW-Authenticate"] = "Basic realm=\"Swagger Documentation\"";
                        await context.Response.WriteAsync("Unauthorized access to API documentation");
                        return;
                    }

                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    if (authHeader.StartsWith("Basic "))
                    {
                        var encodedCredentials = authHeader.Substring("Basic ".Length);
                        var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(encodedCredentials));
                        var parts = credentials.Split(':');

                        if (parts.Length == 2 && parts[0] == "admin" && parts[1] == swaggerPassword)
                        {
                            await next();
                            return;
                        }
                    }

                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Invalid credentials");
                });
            });
    }
    else
    {
        // 🔒 Producción: Swagger COMPLETAMENTE DESHABILITADO
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/swagger") ||
                context.Request.Path.StartsWithSegments("/docs"))
            {
                context.Response.StatusCode = 404;
                await context.Response.WriteAsync("Not Found");
                return;
            }
            await next();
        });
    }

    // 12. Configuración de Health Checks Endpoints
    app.MapHealthChecks("/health", new HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
        {
            context.Response.ContentType = "application/json";

            var result = new
            {
                status = report.Status.ToString(),
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                totalDuration = report.TotalDuration.TotalMilliseconds,
                entries = report.Entries.Select(e => new
                {
                    name = e.Key,
                    status = e.Value.Status.ToString(),
                    duration = e.Value.Duration.TotalMilliseconds,
                    description = e.Value.Description,
                    exception = e.Value.Exception?.Message
                })
            };

            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true }));
        }
    });

    // Health check simplificado para load balancers
    app.MapHealthChecks("/health/live", new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("live") || check.Name == "self"
    });

    // Health check completo para monitoreo
    app.MapHealthChecks("/health/ready", new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("ready") || check.Name == "database"
    });

    // 13. Configuración de middleware pipeline
    // Aplicar RateLimiter solo a rutas de API/Admin para evitar limitar assets estáticos
    app.UseWhen(context =>
            context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase) ||
            context.Request.Path.StartsWithSegments("/Admin", StringComparison.OrdinalIgnoreCase),
        subApp =>
        {
            subApp.UseRateLimiter();
        });
    app.UseRouting();
    app.UseCors(corsPolicy);
    app.UseCookiePolicy();
    app.UseSession();

    // 🔑 Middleware personalizado para JWT en cookies
    app.UseMiddleware<JwtCookieMiddleware>();

    app.UseAuthentication();
    app.UseAuthorization();

    // Configurar archivos estáticos del frontend DESPUÉS de autorización
    var frontendPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), ".."));
   // Log.Information($"📁 Intentando servir archivos desde: {frontendPath}");

    if (Directory.Exists(frontendPath))
    {
        var fileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath);

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = fileProvider,
            RequestPath = ""
        });

       // Log.Information($"✅ Archivos estáticos configurados desde: {frontendPath}");
    }
    else
    {
        Log.Warning($"⚠️ Directorio frontend no encontrado: {frontendPath}");
    }

    // ✅ Agregar logging de requests con Serilog (solo errores)
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.GetLevel = (httpContext, elapsed, ex) => ex != null
            ? Serilog.Events.LogEventLevel.Error
            : httpContext.Response.StatusCode > 499
                ? Serilog.Events.LogEventLevel.Error
                : Serilog.Events.LogEventLevel.Debug; // Debug en lugar de Information
    });

    app.MapControllers();

    // Mapear archivos específicos del frontend
    app.MapGet("/", async context =>
    {
        context.Response.Redirect("/Home.html");
    });

    app.MapGet("/admin", async context =>
    {
        context.Response.Redirect("/admin/auth/login.html");
    });

    // Fallback para SPA - si no es API, servir archivo estático
    app.MapFallback(async context =>
    {
        var path = context.Request.Path.Value;

        // Si la ruta empieza con /api o /Admin, no hacer fallback
        if (path.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/Admin", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = 404;
            return;
        }

        // Intentar servir el archivo
        var filePath = Path.Combine(frontendPath, path.TrimStart('/'));

        if (File.Exists(filePath))
        {
            var contentType = GetContentType(filePath);
            context.Response.ContentType = contentType;
            await context.Response.SendFileAsync(filePath);
        }
        else
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsync("File not found");
        }
    });

    // Helper para content types
    static string GetContentType(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        return ext switch
        {
            ".html" => "text/html",
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".json" => "application/json",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".ico" => "image/x-icon",
            ".woff" => "font/woff",
            ".woff2" => "font/woff2",
            ".ttf" => "font/ttf",
            ".eot" => "application/vnd.ms-fontobject",
            _ => "application/octet-stream"
        };
    }

    // Log final antes de iniciar (SIN MOSTRAR CREDENCIALES)
   // Log.Information("🚀 OrigamiBack API iniciada correctamente");
   // Log.Information($"🔗 Base de datos: {(!string.IsNullOrEmpty(connectionString) ? "✅ Conectada" : "❌ Error")}");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "❌ ERROR FATAL AL INICIAR LA APP");
    throw;
}
finally
{
    Log.CloseAndFlush();
}