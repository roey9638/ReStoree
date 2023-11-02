using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers
{
    public class PagedList<T> : List<T>
    {

        // When we [create] a [new instance] of the [PagedList] will [PASS] in the [Params]. Continue DownVV
        // When will [return] this [PagedList] will have all the [MetaData] [including] the [items] inside it.
        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            MetaData = new MetaData
            {
                TotalCount = count,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(count / (double)pageSize)
            };
            AddRange(items);
        }

        public MetaData MetaData { get; set; }
        

        public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
        {
            var count = await query.CountAsync();

            // The [(pageNumber - 1) * pageSize)] is for how much [items] we want to get. Continue DownVV
            // [For example] if the [pageNumber] is (1) and the [pageSize] is (10). Continue DownVV
            // It will give us (0) [becuase] we don't want to [Skip] [Anything]. [But] we [do want] the [first] (10) [items].
            // The [Take] will [give us] the [rest] of the [items] that we want.
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}