using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace TaskHandler.Integrations.DataAccess.Extensions
{
    public static class DatebaseExtensions
    {
        public static void ApplyTaskHandlerMigrations(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<Contexts.TaskHandlerContext>();

            if (context.Database.GetPendingMigrations().Any())
                context.Database.Migrate();
        }
    }
}
