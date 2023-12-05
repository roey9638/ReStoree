using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities.OrderAggregate
{
    public class OrderItem
    {
        public int Id { get; set; }

        // In the [OrderItem] [Table] will see the [ItemOrdered] with the [Other Properties] here
        public ProductItemOrdered ItemOrdered { get; set; }
        public long Price { get; set; }
        public int Quantity { get; set; }
    }
}