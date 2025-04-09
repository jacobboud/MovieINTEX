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

        [HttpGet("movies")]
        public IActionResult GetMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length > 100)
                return BadRequest("Invalid movie name query.");

            var results = _recommendationService.SearchMovies(query);
            return Ok(results);
        }

        [HttpGet("all-movies")]
        public IActionResult GetAllMovies()
        {
            var results = _recommendationService.GetAllMovies();
            return Ok(results);
        }

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

        [HttpPut("UpdateMovie/{id}")]
        public IActionResult UpdateMovie(string id, [FromBody] Movie_Titles movie)
        {
            var updatedMovie = _recommendationService.UpdateMovie(id, movie);
            if (updatedMovie == null)
                return NotFound();
            return Ok(updatedMovie);
        }

        [HttpDelete("DeleteMovie/{id}")]
        public IActionResult DeleteMovie(string id)
        {
            var success = _recommendationService.DeleteMovie(id);
            if (!success)
                return NotFound();
            return NoContent();
        }
    }
}
