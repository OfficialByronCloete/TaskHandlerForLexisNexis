using TaskHandler.Common.Enums;

namespace TaskHandler.Core.Models
{
    public class TaskModel
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; } = string.Empty;
        public Status Status { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
