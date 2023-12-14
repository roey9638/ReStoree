using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using Microsoft.EntityFrameworkCore;

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
                PaymentIntentId = basket.PaymentIntentId,
                ClientSecret = basket.ClientSecret,
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

        public static IQueryable<Basket> RetrieveBasketWithItems(this IQueryable<Basket> query, string buyerId)
        {
            return query
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .Where(basket => basket.BuyerId == buyerId);
        }
    }

}