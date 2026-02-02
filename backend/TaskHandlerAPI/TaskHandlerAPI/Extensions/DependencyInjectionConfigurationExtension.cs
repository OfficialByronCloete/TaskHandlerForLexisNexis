using TaskHandler.Integrations.DataAccess.Repositories;
using TaskHandler.Services.Contracts;
using TaskHandler.Services.Services;

namespace TaskHandler.WebAPI.Extensions
{
    public static class DependencyInjectionConfigurationExtension
    {
        public static void ConfigureCustomDependencyInjection(this IServiceCollection services, WebApplicationBuilder builder)
        {
            // Services
            services.AddTransient<ITaskService, TaskService>();

            // Repositories
            services.AddTransient<ITaskRepository, TaskRepository>();
        }
    }
}
