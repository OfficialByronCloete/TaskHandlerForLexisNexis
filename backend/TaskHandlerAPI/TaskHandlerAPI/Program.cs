using Microsoft.OpenApi;
using TaskHandler.Integrations.DataAccess.Extensions;
using TaskHandler.WebAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// Services
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
// (Pick one approach long-term; keeping both as-is, just ordered sensibly.)
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

// Startup tasks
app.Services.ApplyTaskHandlerMigrations();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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
