using System;
using System.Collections.Generic;
using System.Text;
using TaskHandler.Common.Models;

namespace TaskHandler.Integrations.DataAccess.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, PaginationModel paginationModel)
        {
            if (paginationModel.PageNumber < 1) paginationModel.PageNumber = 1;
            if (paginationModel.PageSize < 1) paginationModel.PageSize = 10;
            return query.Skip((paginationModel.PageNumber - 1) * paginationModel.PageSize).Take(paginationModel.PageSize);
        }
    }
}
