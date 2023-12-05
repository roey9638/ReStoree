using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class StoreContext : IdentityDbContext<User, Role, int>
    {
        public StoreContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Basket> Baskets { get; set; }
        public DbSet<Order> Orders { get; set; }

        // This will [allow us] to [initialze] [properties] when the [app] is [loaded].
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
                .HasOne(a => a.Address)
                .WithOne()
                .HasForeignKey<UserAddress>(a => a.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // The [IdentityRole] Came from a [NugetPackeg] we [Installed]
            // This will [create] a [Table] in are [Database]. And we just [Adding Roles] to the [Table].
            builder.Entity<Role>()
                .HasData(
                    new Role{Id = 1, Name = "Member", NormalizedName = "MEMBER"},
                    new Role{Id = 2, Name = "Admin", NormalizedName = "ADMIN"}
                );
        }
    }
}