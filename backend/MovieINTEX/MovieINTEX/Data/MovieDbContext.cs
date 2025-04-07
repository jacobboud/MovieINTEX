using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;


namespace WaterProject.Data
{
    public class MovieDbContext : DbContext
    {

        public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
        {

        }

        public DbSet<MovieRating> movies_ratings { get; set; }
        public DbSet<Movie_Titles> movies_titles { get; set; }
        public DbSet<Movie_Users> movies_users { get; set; }
      
    }
}
