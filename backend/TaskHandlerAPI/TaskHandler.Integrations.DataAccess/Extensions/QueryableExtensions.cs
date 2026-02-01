using TaskHandler.Common.Models;

namespace TaskHandler.Integrations.DataAccess.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, PaginationModel paginationModel)
        {
            var pageNumber = paginationModel.Page < 1 ? 1 : paginationModel.Page;
            var pageSize = paginationModel.PageSize < 1 ? 10 : paginationModel.PageSize;
            return query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
    }
}
