using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Project.Backend.Data;
using Project.Backend.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Добавьте эту строку после CreateBuilder
builder.WebHost.UseUrls("http://*:80");

//Аутентификация
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["access_token"];
            return Task.CompletedTask;
        }
    };
});

// Корсы
builder.Services.AddCors(options => 
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:80", "http://localhost:5000")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

builder.Services.AddScoped<IHallCapacityService, HallCapacityService>();

//БД
builder.Services.AddDbContext<AppDBContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//Сваггер
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Library API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization via cookies",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.ConfigObject.AdditionalItems["persistAuthorization"] = true;
    });
}

app.UseHttpsRedirection();

//Миграции
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDBContext>();
        
        // Ждем пока БД станет доступна (макс 30 секунд)
        var maxRetries = 30;
        var delay = 1000; // 1 секунда
        while (!context.Database.CanConnect() && maxRetries-- > 0)
        {
            Console.WriteLine($"Database not ready. Retrying in {delay}ms... ({maxRetries} retries left)");
            await Task.Delay(delay);
        }

        if (context.Database.CanConnect())
        {
            // Применяем миграции
            context.Database.Migrate();
            await SeedData.Initialize(context, "1234");
        }
        else
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError("Failed to connect to database after 30 seconds");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database initialization error");
    }
}

app.Use(async (context, next) =>
{
    var token = context.Request.Cookies["access_token"];
    if (!string.IsNullOrEmpty(token))
    {
        context.Request.Headers["Authorization"] = $"Bearer {token}";
    }
    await next();
});

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();