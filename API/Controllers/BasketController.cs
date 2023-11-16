
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
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
            var basket = await RetrieveBasket(GetBuyerId());

            if (basket == null)
            {
                return NotFound();
            }

            return basket.MapBasketToDto();
        }


        // The [int productId, int quantity] will get the [value] in the [quary string] from the [agent class] in the [client]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            // Too [Add] an [item] to a [basket] we [first] need to [find] it
            var basket = await RetrieveBasket(GetBuyerId());

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
                return CreatedAtRoute("GetBasket", basket.MapBasketToDto());
            }

            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }


        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
        {
            // Too [Remove] an [item] from a [basket] we [first] need to [find] it
            var basket = await RetrieveBasket(GetBuyerId());

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

            return BadRequest(new ProblemDetails { Title = "Problem removing item from basket" });
        }


        // Here will be [able] to [get] the [basket] from the [user] [based] on his [cookie/buyerId]
        private async Task<Basket> RetrieveBasket(string buyerId)
        {
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId");
                return null;
            }

            return await _context.Baskets
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(basket => basket.BuyerId == buyerId);
        }

        private string GetBuyerId()
        {
            // Here i will return the [Name] of a [user] as the [buyerId]. Continue DownVV
            // Or if the [Name] is [Empty] which [mean] the [user] is [not ][logged in]. Will Just get the [Request.Cookies["buyerId"]]
            return User.Identity?.Name ?? Request.Cookies["buyerId"];
        }

        // Here will [create] a [new basket] [with] a new [cookie/buyerId] for the [user]
        private Basket CreateBasket()
        {
            // Here i will return the [Name] of a [user] as the [buyerId] [If] the [user] is [logged in]
            var buyerId = User.Identity?.Name;

            // Here if the [buyerId] is [Empty] so the [user] is [not] [logged in]. Continue DownVV
            // Then i will [Create] a new [buyerId]
            if (string.IsNullOrEmpty(buyerId))
            {
                buyerId = Guid.NewGuid().ToString();

                var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };

                Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            }

            var basket = new Basket { BuyerId = buyerId };

            _context.Baskets.Add(basket);

            return basket;
        }
    }
}