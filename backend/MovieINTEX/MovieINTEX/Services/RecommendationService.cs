using MovieINTEX.Data;
using MovieINTEX.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace MovieINTEX.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly MovieDbContext _context;

        public RecommendationService(MovieDbContext context)
        {
            _context = context;
        }

        public List<MovieDto> SearchMovies(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<MovieDto>();

            return _context.movies_titles
                .Where(m => m.title.ToLower().Contains(query.ToLower()))
                .OrderBy(m => m.title)
                .Select(m => new MovieDto
                {
                    ShowId = m.show_id,
                    Title = m.title,
                    ReleaseYear = m.release_year,
                    Description = m.description
                })
                .ToList();
        }


        public List<MovieDto> GetAllMovies()
        {
            return _context.movies_titles
                .OrderBy(m => m.title)
                .Select(m => new MovieDto
                {
                    ShowId = m.show_id,
                    Title = m.title,
                    ReleaseYear = m.release_year,
                    Description = m.description
                })
                .ToList();
        }

        public List<string> GetAllMovieCategories()
        {
            return typeof(Movie_Titles).GetProperties()
                .Where(p => p.PropertyType == typeof(bool))
                .Select(p =>
                {
                    var columnAttr = p.GetCustomAttributes(typeof(ColumnAttribute), false)
                                      .Cast<ColumnAttribute>()
                                      .FirstOrDefault();
                    return columnAttr?.Name ?? p.Name;
                })
                .ToList();
        }

        public async Task<List<CarouselDto>> GetCarouselsForUserAsync(int userId)
        {
            var carousels = new List<CarouselDto>();
            var user = await _context.movies_users.FindAsync(userId);
            if (user == null) return carousels;

            var ratedShowIds = await _context.movies_ratings
                .Where(r => r.UserId == userId)
                .Select(r => r.ShowId.ToString()) // <-- ensure string type
                .ToListAsync();


            var highRatedShows = await _context.movies_ratings
                .Where(r => r.UserId == userId && r.Rating >= 4)
                .Select(r => r.ShowId.ToString()) // <-- convert to string
                .ToListAsync();

            var titlesDict = await _context.movies_titles.ToDictionaryAsync(t => t.show_id);

            // Helper method to map show IDs to CarouselItems
            List<CarouselItemDto> MapShowIds(IEnumerable<string> showIds)
            {
                return showIds.Where(id => titlesDict.ContainsKey(id))
                    .Select(id => new CarouselItemDto
                    {
                        ShowId = id,
                        Title = titlesDict[id].title,
                        Description = titlesDict[id].description,
                        ImageUrl = $"/Movie Posters/{titlesDict[id].title}.jpg"
                    }).ToList();
            }

            // 1. Recommended for You
            var recAll = await _context.Set<dynamic>().FromSqlRaw($"SELECT * FROM user_recommendations_all WHERE user_id = {userId}").FirstOrDefaultAsync();
            if (recAll != null)
            {
                var showIds = Enumerable.Range(1, 10).Select(i => (string)recAll[$"recommended_show_{i}_id"]);
                carousels.Add(new CarouselDto { Title = "Recommended for You", Items = MapShowIds(showIds) });
            }

            // 2. Lovers Also Loved...
            if (!string.IsNullOrEmpty(user.FavoriteMovie) && titlesDict.ContainsKey(user.FavoriteMovie))
            {
                var row = await _context.Set<dynamic>().FromSqlRaw($"SELECT * FROM show_recommendations WHERE show_id = '{user.FavoriteMovie}'").FirstOrDefaultAsync();
                if (row != null)
                {
                    var showIds = Enumerable.Range(1, 10).Select(i => (string)row[$"recommended_show_{i}_id"]);
                    carousels.Add(new CarouselDto
                    {
                        Title = $"{titlesDict[user.FavoriteMovie].title} Lovers also Loved...",
                        Items = MapShowIds(showIds)
                    });
                }
            }

            // 3. Because You Liked {title}
            foreach (var showId in highRatedShows)
            {
                if (!titlesDict.ContainsKey(showId)) continue;
                var row = await _context.Set<dynamic>().FromSqlRaw($"SELECT * FROM show_recommendations WHERE show_id = '{showId}'").FirstOrDefaultAsync();
                if (row != null)
                {
                    var showIds = Enumerable.Range(1, 10).Select(i => (string)row[$"recommended_show_{i}_id"]);
                    carousels.Add(new CarouselDto
                    {
                        Title = $"Because you liked {titlesDict[showId].title}",
                        Items = MapShowIds(showIds)
                    });
                }
            }

            // 4. {Category} Movies You Might Like
            var categories = new[] { "Action", "Adventure", "AnimeSeries", "BritishSeries", "Children", "Comedies", "InternationalComedyDramas", "InternationalComedies", "RomanticComedies", "CrimeTVShowsDocuseries", "Documentaries", "InternationalDocumentaries", "Docuseries", "Dramas", "InternationalDramas", "RomanticDramas", "Family", "Fantasy", "Horror", "InternationalThrillers", "InternationalTVRomanticDramas", "Kids", "Language", "Musicals", "NatureTV", "RealityTV", "Spirituality", "ActionTV", "ComedyTV", "DramaTV", "TalkShowTVComedies", "Thrillers" };

            foreach (var category in categories)
            {
                var prop = typeof(Movie_Users).GetProperty(category);
                if (prop != null && prop.PropertyType == typeof(bool) && (bool)(prop.GetValue(user) ?? false))
                {
                    var recs = await _context.Set<dynamic>().FromSqlRaw($"SELECT * FROM user_recommendations_{category.ToLower()} WHERE user_id = {userId}").FirstOrDefaultAsync();
                    if (recs != null)
                    {
                        var showIds = Enumerable.Range(1, 10).Select(i => (string)recs[$"recommended_show_{i}_id"]);
                        carousels.Add(new CarouselDto
                        {
                            Title = $"{category} Movies You Might Like",
                            Items = MapShowIds(showIds)
                        });
                    }
                }
            }

            // 5. Other {streaming service} Watchers Enjoyed
            var services = new[] { "Netflix", "Amazon Prime", "Disney+", "Paramount+", "Max", "Hulu", "Apple TV+", "Peacock" };

            foreach (var service in services)
            {
                var prop = typeof(Movie_Users).GetProperty(service);
                if (prop != null && prop.PropertyType == typeof(bool) && (bool)(prop.GetValue(user) ?? false))
                {
                    var row = await _context.Set<dynamic>().FromSqlRaw($"SELECT * FROM show_recommendations_streaming WHERE streaming_service = '{service}'").FirstOrDefaultAsync();
                    if (row != null)
                    {
                        var showIds = Enumerable.Range(1, 10).Select(i => (string)row[$"recommended_show_{i}_id"]);
                        carousels.Add(new CarouselDto
                        {
                            Title = $"Other {service} Watchers Enjoyed",
                            Items = MapShowIds(showIds)
                        });
                    }
                }
            }

            // 6. Try a Random Movie
            var allShows = titlesDict.Keys.Except(ratedShowIds).OrderBy(_ => Guid.NewGuid()).Take(20);
            carousels.Add(new CarouselDto
            {
                Title = "Try a Random Movie",
                Items = MapShowIds(allShows)
            });

            return carousels;
        }

    }
}
