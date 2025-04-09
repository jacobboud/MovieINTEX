using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;
using MovieINTEX.Models.Dto;
using MovieINTEX.Services;

namespace MovieINTEX.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public MovieController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }
        [Authorize]
        [HttpGet("movies")]
        public IActionResult GetMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length > 100)
                return BadRequest("Invalid movie name query.");

            var results = _recommendationService.SearchMovies(query);
            return Ok(results);
        }
        [Authorize]
        [HttpGet("all-movies")]
        public IActionResult GetAllMovies()
        {
            var results = _recommendationService.GetAllMovies();
            return Ok(results);
        }
        
        [Authorize]
        [HttpGet("paged-movies")]
        public IActionResult GetPagedMovies(
            int page = 1,
            int pageSize = 10,
            string? category = null,
            string? sortBy = "NameAsc")
        {
            if (page <= 0 || pageSize <= 0)
                return BadRequest("Page and pageSize must be positive numbers.");

            var totalMovies = _recommendationService.GetTotalMovieCount(category);
            var pagedMovies = _recommendationService.GetPagedMovies(page, pageSize, category, sortBy);

            return Ok(new
            {
                total = totalMovies,
                page,
                pageSize,
                movies = pagedMovies
            });
        }
        
        [Authorize]
        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = _recommendationService.GetAllMovieCategories();
            return Ok(categories);
        }

        [Authorize]
        [HttpGet("carousels")]
        public async Task<IActionResult> GetCarouselsForUser(
            [FromServices] UserManager<IdentityUser> userManager,
            [FromServices] MovieDbContext movieDbContext,
            [FromServices] IRecommendationService recommendationService)
        {
            var identityUserId = userManager.GetUserId(User);
            var movieUser = await movieDbContext.movies_users
                .FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);

            if (movieUser == null)
            {
                return NotFound("Movie user not found.");
            }

            var carousels = await recommendationService.GetCarouselsWithUserInfoAsync(movieUser.UserId);

            return Ok(carousels);
        }
        
        
        [Authorize (Roles = "Admin")]
        [HttpPost("AddMovie")]
        public IActionResult AddMovie([FromBody] Movie_Titles movie)
        {
            try
            {
                if (movie == null)
                {
                    return BadRequest("Movie data is invalid.");
                }

                var addedMovie = _recommendationService.AddMovie(movie);

                return Ok(addedMovie);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error adding movie: {ex.Message}");
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateMovie/{id}")]
        public IActionResult UpdateMovie(string id, [FromBody] Movie_Titles movie)
        {
            var updatedMovie = _recommendationService.UpdateMovie(id, movie);
            if (updatedMovie == null)
                return NotFound();
            return Ok(updatedMovie);
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteMovie/{id}")]
        public IActionResult DeleteMovie(string id)
        {
            var success = _recommendationService.DeleteMovie(id);
            if (!success)
                return NotFound();
            return NoContent();
        }

        [Authorize]
        [HttpGet("movie-details/{showId}")]
        public async Task<IActionResult> GetMovieDetails(string showId, [FromServices] MovieDbContext dbContext, [FromServices] UserManager<IdentityUser> userManager)
        {
            var movie = await dbContext.movies_titles.FindAsync(showId);
            if (movie == null) return NotFound();

            var identityUserId = userManager.GetUserId(User);
            var movieUser = await dbContext.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);

            int? userRating = null;

            if (movieUser != null)
            {
                var userRatingEntry = await dbContext.movies_ratings
                    .FirstOrDefaultAsync(r => r.UserId == movieUser.UserId && r.ShowId == showId);
                userRating = userRatingEntry?.Rating;
            }

            var averageRating = await dbContext.movies_ratings
                .Where(r => r.ShowId == showId)
                .AverageAsync(r => (double?)r.Rating) ?? 0;

            var categories = typeof(Movie_Titles).GetProperties()
                .Where(p => p.PropertyType == typeof(bool) && (bool)(p.GetValue(movie) ?? false))
                .Select(p =>
                {
                    var columnAttr = p.GetCustomAttributes(typeof(ColumnAttribute), false).FirstOrDefault() as ColumnAttribute;
                    return columnAttr?.Name ?? p.Name;
                })
                .ToList();

            return Ok(new
            {
                movie.show_id,
                movie.title,
                movie.type,
                movie.director,
                movie.cast,
                movie.country,
                movie.release_year,
                movie.rating,
                movie.duration,
                movie.description,
                categories,
                averageRating,
                userRating
            });
        }

        [Authorize]
        [HttpGet("movie-recommendations/{showId}")]
        public async Task<IActionResult> GetMovieRecommendations(
            string showId,
            [FromServices] MovieDbContext dbContext,
            [FromServices] IRecommendationService recommendationService)
                {
                    var safeShowId = showId.Replace("'", "''");
                    var recIds = await recommendationService.GetRecommendationsForShowAsync(showId);


            var titlesDict = await dbContext.movies_titles.ToDictionaryAsync(t => t.show_id);

                    var recommended = recIds
                        .Where(id => titlesDict.ContainsKey(id))
                        .Select(id => new MovieDto
                        {
                            ShowId = id,
                            Title = titlesDict[id].title,
                            Description = titlesDict[id].description
                        }).ToList();

                    return Ok(recommended);
                }


        [Authorize]
        [HttpPost("rate")]
        public async Task<IActionResult> RateMovie([FromBody] MovieRating rating, [FromServices] UserManager<IdentityUser> userManager, [FromServices] MovieDbContext dbContext)
        {
            var identityUserId = userManager.GetUserId(User);
            var movieUser = await dbContext.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);
            if (movieUser == null) return Unauthorized();

            var existingRating = await dbContext.movies_ratings
                .FirstOrDefaultAsync(r => r.UserId == movieUser.UserId && r.ShowId == rating.ShowId);

            if (existingRating != null)
            {
                existingRating.Rating = rating.Rating;
            }
            else
            {
                rating.UserId = movieUser.UserId;
                dbContext.movies_ratings.Add(rating);
            }

            await dbContext.SaveChangesAsync();
            return Ok();
        }


    }
}
