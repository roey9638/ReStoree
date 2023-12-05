using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;
        private readonly StoreContext _context;
        public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _context = context;
        }


        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // Here i will [Check] if the [user] [Exists] in the [Database]
            var user = await _userManager.FindByNameAsync(loginDto.Username);

            // Here i [Check] the [Username] of the [user]. Or i will [Check] if the [user Password] [Match] what is [inside] the [Database].
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return Unauthorized();
            }

            // Here i want to [Retrieve the Basket] of the [user] [Based] on his [Username] which [his also] the [buyerId]
            var userBasket = await RetrieveBasket(loginDto.Username);

            // Here i want to [Retrieve the Basket] Which is [anonymous] [Because] the [user] is [not] [logged in] [Based] [Request.Cookies["buyerId"]]
            var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]);

            // Here I'm doing that if the [anonBasket != null] And we [login in]. I will [transfer] the [this basekt -> (anonBasket)] to the [logged in] [user]
            if (anonBasket != null)
            {
                // Here I'm [Checking] if the [userBasket != null] Which [means] he has a [basket]. Continue DownVV
                // Then i want to [remove it] [because] i want to set the [anonBasket] to the [user]
                if (userBasket != null) _context.Baskets.Remove(userBasket);
                // Here I'm [setting] that the [BuyerId] of the [anonBasket] will be the [UserName] of the [logged in] [user]
                anonBasket.BuyerId = user.UserName;
                // Here I'm [Deleting] the [buyerId] of the [anonBasket] [Because] we set it to the [UserName] of the [logged in] [user] [From] The [Line] Above^^
                Response.Cookies.Delete("buyerId");
                await _context.SaveChangesAsync();
            }

            return new UserDto
            {
                Email = user.Email,
                // The [_tokenService.GenerateToken(user)] Will [create] a [Token] that the [user] will [be able] to [login] with.
                Token = await _tokenService.GenerateToken(user),
                // Here i will just [MAP] the [anonBasket] OR the [userBasket] from a [Basket] to [BasketDto]
                Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto()
            };
        }


        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            // Here i [Creating] a new [user] with [UserName] and [Email]
            var user = new User { UserName = registerDto.Username, Email = registerDto.Email };

            // Here I'm [Adding] the [Password] to the [Database] that the [user] [Input] to the new [user] we just [Created]
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                // Here I'm [Looping] threw all the [Erros] for [Example] The [Email is Wrong] or the [Password is Weak]
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return ValidationProblem();
            }

            // Here I'm just [Adding] a [Role] to the [Database] to the [user] we [Created]
            await _userManager.AddToRoleAsync(user, "Member");

            return StatusCode(201);
        }


        // The [Authorize] is for that we will have to [Authenticate]!!!
        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            // This [User.Identity.Name] will take are [Claim Name] from the [Token]
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var userBasket = await RetrieveBasket(User.Identity.Name);

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = userBasket?.MapBasketToDto()
            };
        }


        [Authorize]
        [HttpGet("savedAddress")]
        public async Task<ActionResult<UserAddress>> GetSavedAddress()
        {
            return await _userManager.Users
                .Where(x => x.UserName == User.Identity.Name)
                .Select(user => user.Address)
                .FirstOrDefaultAsync();
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
    }
}