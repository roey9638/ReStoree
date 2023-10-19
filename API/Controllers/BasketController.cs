
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BasketController : BaseApiController
    {
        private readonly StoreContext _context;

        public BasketController(StoreContext context)
        {
            _context = context;
        }


        [HttpGet(Name = "GetBasket")]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            // When a [user] creates a [Basket] on our [server] will [return] him a ["buyerId"]. Continue DownVV
            // Which will be send to back to them as a [cookie]. and they [stored] in the [user browser]
            var basket = await RetrieveBasket();

            if (basket == null)
            {
                return NotFound();
            }

            return MapBasketToDto(basket);
        }


        // The [int productId, int quantity] will get the [value] in the [quary string] from the [agent class] in the [client]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            // Too [Add] an [item] to a [basket] we [first] need to [find] it
            var basket = await RetrieveBasket();

            // If we [dont] have [basket] to [add] an [item] to will [create one]
            if (basket == null)
            {
                basket = CreateBasket();
            }

            var product = await _context.Products.FindAsync(productId);

            if (product == null)
            {
                return BadRequest(new ProblemDetails { Title = "Product not found" });
            }

            // [Roy] -> This is just call a [Function] from a [Service class] like other [projects]
            // This is just [adding] the [product/item] to the [basket] that we just [found] or [created]
            basket.AddItem(product, quantity);

            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                // The [CreatedAtRoute()] need [2 params] VV
                // ["GetBasket"] [param] is [where] we [created] the [object]. Will get it from the [GetBasket()] [Function] Above^^
                // [MapBasketToDto(basket)] the [basket] is the [value/object] we [created]
                return CreatedAtRoute("GetBasket", MapBasketToDto(basket));
            }

            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }


        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            // Too [Remove] an [item] from a [basket] we [first] need to [find] it
            var basket = await RetrieveBasket();

            if (basket == null)
            {
                return NotFound();
            }

            // [Roy] -> This is just call a [Function] from a [Service class] like other [projects]
            // This is just [removing] the [product/item] to the [basket] that we just [found]
            basket.RemoveItem(productId, quantity);

            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                return Ok();
            }

            return BadRequest(new ProblemDetails{Title = "Problem removing item from basket"});
        }


        // Here will be [able] to [get] the [basket] from the [user] [based] on his [cookie/buyerId]
        private async Task<Basket> RetrieveBasket()
        {
            return await _context.Baskets
                    .Include(i => i.Items)
                    .ThenInclude(p => p.Product)
                    .FirstOrDefaultAsync(x => x.BuyerId == Request.Cookies["buyerId"]);
        }


        // Here will [create] a [new basket] [with] a new [cookie/buyerId] for the [user]
        private Basket CreateBasket()
        {
            var buyerId = Guid.NewGuid().ToString();

            var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };

            Response.Cookies.Append("buyerId", buyerId, cookieOptions);

            var basket = new Basket { BuyerId = buyerId };

            _context.Baskets.Add(basket);

            return basket;
        }


        private BasketDto MapBasketToDto(Basket basket)
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