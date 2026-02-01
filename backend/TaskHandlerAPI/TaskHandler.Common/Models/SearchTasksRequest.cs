namespace TaskHandler.Common.Models
{
    public sealed class SearchTasksRequest
    {
        public FilterModel Filter { get; init; } = new();
        public PaginationModel Pagination { get; init; } = new();
    }
}
