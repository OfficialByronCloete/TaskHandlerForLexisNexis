namespace TaskHandler.Core.Models
{
    /// <summary>
    /// Placeholder for User model.
    /// </summary>
    public class UserModel
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
