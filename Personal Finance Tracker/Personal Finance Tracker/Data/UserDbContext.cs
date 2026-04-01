using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Models;
namespace Personal_Finance_Tracker.Data
{
    public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }

    }
}
