using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace API.Entities.OrderAggregate
{
    // The [Owned] [Means] that if we have this [class]. Continue DownVV
    // [ProductItemOrdered] For example as a [Property] In other [class]. Continue DownVV
    // Then will [see] that [Property] in the other [class] [Table]
    [Owned]
    public class ProductItemOrdered
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string PictureUrl { get; set; }
    }
}