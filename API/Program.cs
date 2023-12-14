using System.Text;
using API.Data;
using API.Entities;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Here I'm [Setting] [Swagger] to [know how] to [send up] [Authentication Header]
builder.Services.AddSwaggerGen(c => 
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Put Bearer + your token in the box below",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            jwtSecurityScheme, Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<StoreContext>(opt => 
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});


builder.Services.AddCors();

// Now that we add [AddIdentityCore] We [will have] a new [Service] called [UserManager]
// The [opt] will [allow] to make [sure] [For Example] -> that You can [use] [Email Address] [Only Once]
builder.Services.AddIdentityCore<User>(opt => 
{
    opt.User.RequireUniqueEmail = true;
    // I Added that -> [Maybe] will [need] to [Delete] this!!!
    opt.Password.RequireNonAlphanumeric = false;
})
    .AddRoles<Role>()
    .AddEntityFrameworkStores<StoreContext>();

// Here I can [Authenticate] to the [API] And also [How] I'm [Authenticaten] to the [API].
// For [Example] -> The [users] are going to [Present] there [toekn] [inside] an [Authorization Header] in the [HTTP Requests]. Continue DownVV
// And then the [Server] will [Check] it for it's [validity].
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        // Here I'm [telling] the [API] What to [validate] [Against] [using] the [Token].
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // The [SymmetricSecurityKey] Will [Encrypt] as [Also] will [Decrypt] the [Signature]
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration["JWTSettings:Tokenkey"]))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PaymentService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");
    });
}

//app.UseHttpsRedirection();

app.UseCors(opt => 
{
    // This is to [allow] [requests] from other [origins]. for example this Origin ("localhost:3000")
    opt.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("http://localhost:3000");
});

// Has to be [Above] [app.UseAuthorization()]!!!
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();


var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<StoreContext>();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

try
{
    await context.Database.MigrateAsync();
    await DbInitializer.Initialize(context, userManager);
}
catch (Exception ex)
{
    logger.LogError(ex, "Problem Migrating Data");
}

app.Run();

