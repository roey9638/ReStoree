using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;

namespace API.Extensions
{
    public static class BasketExtensions
    {

        public static BasketDto MapBasketToDto(this Basket basket)
        {
            return new BasketDto
            {
                // Here will [map] the [basket] [properties] to the [new BasketDto]
                Id = basket.Id,
                BuyerId = basket.BuyerId,
                // Here will [map] the [basketItems] [properties] from the [basket] to the [new BasketItemDto] that is a [list] [inside] the [new BasketDto]
                Items = basket.Items.Select(item => new BasketItemDto
                {
                    ProductId = item.ProductId,
                    Name = item.Product.Name,
                    Price = item.Product.Price,
                    PictureUrl = item.Product.PictureUrl,
                    Type = item.Product.Type,
                    Brand = item.Product.Brand,
                    Quantity = item.Quantity
                }).ToList()
            };
        }
    }

}