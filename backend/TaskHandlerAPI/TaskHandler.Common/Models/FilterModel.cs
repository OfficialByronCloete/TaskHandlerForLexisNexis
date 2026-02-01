using TaskHandler.Common.Enums;

namespace TaskHandler.Common.Models
{
    public class FilterModel
    {
        public string SearchTerm { get; set; } = string.Empty;
        public IEnumerable<OrderBy>? OrderBy { get; set; }
        public Priority? Priority { get; set; }
        public IEnumerable<Status>? Statuses { get; set; }
    }
}
