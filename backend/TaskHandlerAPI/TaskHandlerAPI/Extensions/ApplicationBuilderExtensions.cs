using Microsoft.AspNetCore.Builder;
using TaskHandler.WebAPI.Middleware;

namespace TaskHandler.WebAPI.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
            => app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
    }
}
