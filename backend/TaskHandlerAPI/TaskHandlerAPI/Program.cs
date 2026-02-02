using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using TaskHandler.Integrations.DataAccess.Contexts;
using TaskHandler.Integrations.DataAccess.Extensions;
using TaskHandler.WebAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Console logging + reduce noise
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Keep your app logs visible
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Cut common noise
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);

// Allow request logs (our middleware)
builder.Logging.AddFilter("TaskHandler.WebAPI.RequestLogging", LogLevel.Information);

var services = builder.Services;

var provider = builder.Configuration["Database:Provider"];

services.AddDbContext<TaskHandlerContext>(options =>
{
    if (string.Equals(provider, "InMemory", StringComparison.OrdinalIgnoreCase))
        options.UseInMemoryDatabase("TaskHandlerDb");
    else
        options.UseNpgsql(builder.Configuration.GetConnectionString("TaskHandler"));
});

services.AddControllers();

services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

services.ConfigureCustomDependencyInjection(builder);

// OpenAPI/Swagger
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TaskHandlerAPI",
        Version = "v1"
    });
});

services.AddOpenApi();

var app = builder.Build();

app.UseGlobalExceptionHandling();

// Single-line request logging (readable)
app.Use(async (context, next) =>
{
    var logger = context.RequestServices
        .GetRequiredService<ILoggerFactory>()
        .CreateLogger("TaskHandler.WebAPI.RequestLogging");

    var sw = System.Diagnostics.Stopwatch.StartNew();
    try
    {
        await next();
    }
    finally
    {
        sw.Stop();

        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? "/";
        var query = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : "";
        var status = context.Response.StatusCode;

        logger.LogInformation("{Method} {Path}{Query} -> {StatusCode} ({ElapsedMs} ms)",
            method, path, query, status, sw.ElapsedMilliseconds);
    }
});

// Only run migrations for relational providers (InMemory doesn't support migrations)
if (!string.Equals(provider, "InMemory", StringComparison.OrdinalIgnoreCase))
    app.Services.ApplyTaskHandlerMigrations();

await app.Services.SeedTaskHandlerDataAsync();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskHandlerAPI v1");
});

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.Run();
