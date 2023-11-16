using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class StoreContext : IdentityDbContext<User>
    {
        public StoreContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Basket> Baskets { get; set; }

        // This will [allow us] to [initialze] [properties] when the [app] is [loaded].
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // The [IdentityRole] Came from a [NugetPackeg] we [Installed]
            // This will [create] a [Table] in are [Database]. And we just [Adding Roles] to the [Table].
            builder.Entity<IdentityRole>()
                .HasData(
                    new IdentityRole{Name = "Member", NormalizedName = "MEMBER"},
                    new IdentityRole{Name = "Admin", NormalizedName = "ADMIN"}
                );
        }
    }
}