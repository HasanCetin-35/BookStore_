using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyProject;
using MyProject.Decorators;

using MyProject.Services;
//using Serilog;
var builder = WebApplication.CreateBuilder(args);
// Log.Logger = new LoggerConfiguration()
//     .MinimumLevel.Debug() // Log seviyesini Debug olarak ayarla
//     .WriteTo.Console() // Konsola yaz
//     .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day) // Günlük dosyasına yaz
//     .CreateLogger();

//builder.Host.UseSerilog(); // Serilog'u kullan
// Database ayarları ve servisler
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))); // PostgreSQL bağlantısı

// Database ayarları ve servisler
builder.Services.AddScoped<BooksService>();
builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<CommentsService>();
builder.Services.AddScoped<UserRoleService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<RoleManagementService>();
builder.Services.AddScoped<CurrentUserAttribute>();


// AddControllersWithViews()'i Build()'den önce ekleyin
builder.Services.AddControllersWithViews();

// CORS ekleme
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});
// JWT Authentication ekleme
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            builder.Configuration["JwtSettings:SecretKey"] ?? "DefaultSecretKey"))
    };
});

var app = builder.Build(); // builder.Build() işlemi burada yapılmalı

// Hata yönetimi ve HTTPS yönlendirme
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowAllOrigins");
// Authentication ve Authorization middleware'leri
app.UseAuthentication();
app.UseAuthorization();

// Controller Route tanımlama
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
