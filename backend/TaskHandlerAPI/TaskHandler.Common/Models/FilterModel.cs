using TaskHandler.Common.Enums;

namespace TaskHandler.Common.Models
{
    public class FilterModel
    {
        public string SearchTerm { get; set; } = string.Empty;
        public IEnumerable<OrderBy>? OrderBy { get; set; }
        public IEnumerable<Priority>? Priorities { get; set; }
        public IEnumerable<Status>? Statuses { get; set; }
    }
}
