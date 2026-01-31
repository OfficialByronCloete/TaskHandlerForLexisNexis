using Microsoft.EntityFrameworkCore;
using TaskHandler.Integrations.DataAccess.Entities;

namespace TaskHandler.Integrations.DataAccess.Contexts
{
    public class TaskHandlerContext : DbContext
    {
        public DbSet<TaskEntity> Tasks { get; set; }
        public DbSet<UserEntity> Users { get; set; }

        public TaskHandlerContext() : base() { }

        public TaskHandlerContext(DbContextOptions<TaskHandlerContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
                optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=devdb;Username=devuser;Password=devpass;");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new TaskEntityConfiguration());
            modelBuilder.ApplyConfiguration(new UserEntityConfiguration());
        }
    }
}
