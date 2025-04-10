using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;

namespace MovieINTEX.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MovieDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public UserController(MovieDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/user/profile
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var identityUserId = _userManager.GetUserId(User);
            Console.WriteLine($"🔍 identityUserId = {identityUserId}");

            
            var user = await _context.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);
            if (user == null) return NotFound("User not found");

            var ratings = await _context.movies_ratings
                .Where(r => r.UserId == user.UserId)
                .ToListAsync();

            // ✅ Safely build dictionary with trimmed keys and title values
            var movieTitlesDict = await _context.movies_titles
                .Select(m => new { Key = m.show_id.Trim(), m.title })
                .ToDictionaryAsync(m => m.Key, m => m.title);

            // ✅ Map ratings to titles using TRIMMED ShowId
            var ratingWithTitles = ratings.Select(r =>
            {
                var trimmedId = r.ShowId.Trim();
                movieTitlesDict.TryGetValue(trimmedId, out var title);
                return new
                {
                    ShowId = r.ShowId,
                    Title = title ?? "(Unknown)",
                    Rating = r.Rating
                };
            }).ToList();

            // ✅ Resolve favorite movie title the same way
            var favTitle = user.FavoriteMovie != null &&
                           movieTitlesDict.TryGetValue(user.FavoriteMovie.Trim(), out var foundTitle)
                           ? foundTitle
                           : "Unknown";

            var services = typeof(Movie_Users).GetProperties()
                .Where(p => p.PropertyType == typeof(bool) &&
                            (p.Name.EndsWith("Plus") ||
                             new[] { "Netflix", "Max", "Hulu", "Peacock", "AmazonPrime" }.Contains(p.Name)))
                .ToDictionary(p => p.Name, p => (bool)p.GetValue(user)!);

            var categoryKeys = services.Keys.ToHashSet();
            var categories = typeof(Movie_Users).GetProperties()
                .Where(p => p.PropertyType == typeof(bool) && !categoryKeys.Contains(p.Name))
                .ToDictionary(p => p.Name, p => (bool)p.GetValue(user)!);

            foreach (var r in ratingWithTitles)
            {
                Console.WriteLine($"ShowId: {r.ShowId} -> Title: {r.Title}");
            }

            return Ok(new
            {
                user.FavoriteMovie,
                FavoriteMovieTitle = favTitle,
                Ratings = ratingWithTitles,
                Categories = categories,
                Services = services
            });
        }


        // PUT: api/user/favorite-movie
        
        [HttpPut("favorite-movie")]
        public async Task<IActionResult> UpdateFavoriteMovie([FromBody] string showId)
        {
            var identityUserId = _userManager.GetUserId(User);
            var user = await _context.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);
            if (user == null) return NotFound();

            Console.WriteLine($"📩 Received showId: {showId}");

            user.FavoriteMovie = showId;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // PUT: api/user/ratings
        [Authorize]
        [HttpPut("ratings")]
        public async Task<IActionResult> UpdateRatings([FromBody] List<MovieRating> ratings)
        {
            var identityUserId = _userManager.GetUserId(User);
            var user = await _context.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);
            if (user == null) return NotFound();

            var userId = user.UserId;

            foreach (var rating in ratings)
            {
                var existing = await _context.movies_ratings.FirstOrDefaultAsync(r => r.UserId == userId && r.ShowId == rating.ShowId);
                if (existing != null)
                {
                    existing.Rating = rating.Rating;
                }
                else
                {
                    _context.movies_ratings.Add(new MovieRating { UserId = userId, ShowId = rating.ShowId, Rating = rating.Rating });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // PUT: api/user/categories
        [Authorize]
        [HttpPut("categories")]
        public async Task<IActionResult> UpdateCategories([FromBody] Dictionary<string, bool> updatedCategories)
        {
            var identityUserId = _userManager.GetUserId(User);
            var user = await _context.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);
            if (user == null) return NotFound();

            foreach (var entry in updatedCategories)
            {
                var prop = typeof(Movie_Users).GetProperty(entry.Key);
                if (prop != null && prop.PropertyType == typeof(bool))
                {
                    prop.SetValue(user, entry.Value);
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // PUT: api/user/services
        [Authorize]
        [HttpPut("services")]
        public async Task<IActionResult> UpdateServices([FromBody] Dictionary<string, bool> updatedServices)
        {
            var identityUserId = _userManager.GetUserId(User);
            var user = await _context.movies_users.FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId);
            if (user == null) return NotFound();

            foreach (var entry in updatedServices)
            {
                var prop = typeof(Movie_Users).GetProperty(entry.Key);
                if (prop != null && prop.PropertyType == typeof(bool))
                {
                    prop.SetValue(user, entry.Value);
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

