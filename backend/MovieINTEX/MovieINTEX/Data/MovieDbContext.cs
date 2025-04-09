using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;


namespace MovieINTEX.Data
{
    public class MovieDbContext : DbContext
    {

        public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite primary key for MovieRating
            modelBuilder.Entity<MovieRating>()
                .HasKey(r => new { r.UserId, r.ShowId });
        }

        public DbSet<MovieRating> movies_ratings { get; set; }
        public DbSet<Movie_Titles> movies_titles { get; set; }
        public DbSet<Movie_Users> movies_users { get; set; }
      
    }
}
