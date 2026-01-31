using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskHandler.Common.Enums;

namespace TaskHandler.Integrations.DataAccess.Entities
{
    public class TaskEntity
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; } = string.Empty;
        public Status Status { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; }
    }

    public class TaskEntityConfiguration : IEntityTypeConfiguration<TaskEntity>
    {
        public void Configure(EntityTypeBuilder<TaskEntity> builder)
        {
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id).ValueGeneratedOnAdd();

            builder.Property(t => t.Title)
                .HasMaxLength(250)
                .IsRequired();

            builder.Property(t => t.Description)
                .HasMaxLength(10000)
                .IsRequired(false);

            builder.Property(t => t.Status)
                .IsRequired();

            builder.Property(t => t.Priority)
                .IsRequired();

            builder.Property(t => t.DueDate).IsRequired();

            builder.Property(t => t.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("timezone('utc', now())");

            builder.Property(t => t.IsDeleted)
                .HasDefaultValue(false);

            // Global filter for soft deletes
            builder.HasQueryFilter(t => !t.IsDeleted);

            builder.HasIndex(t => t.Title);
            builder.HasIndex(t => t.Description);
        }
    }
}
