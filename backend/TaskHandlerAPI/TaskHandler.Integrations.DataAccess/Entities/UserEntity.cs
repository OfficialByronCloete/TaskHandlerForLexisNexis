using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TaskHandler.Integrations.DataAccess.Entities
{
    public class UserEntity
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserEntityConfiguration : IEntityTypeConfiguration<UserEntity>
    {
        public void Configure(EntityTypeBuilder<UserEntity> builder)
        {
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Username).HasMaxLength(150).IsRequired();
            builder.Property(u => u.Email).HasMaxLength(250).IsRequired();
            builder.Property(u => u.CreatedAt).IsRequired();
        }
    }
}
