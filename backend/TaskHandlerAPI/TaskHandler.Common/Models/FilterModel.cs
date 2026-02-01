using TaskHandler.Common.Enums;

namespace TaskHandler.Common.Models
{
    public class FilterModel
    {
        public string SearchTerm { get; set; } = string.Empty;
        public SearchOrder Order { get; set; } = SearchOrder.Ascending;
        public Priority? Priority { get; set; }
        public Status? Status { get; set; }

    }
}
