using MovieINTEX.Data;
using MovieINTEX.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;
using System.Globalization;
using System.Text;

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

        private async Task<List<string>> GetRecommendationShowIds(string sql)
        {
            var result = new List<string>();
            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = sql;
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            for (int i = 1; i <= 10; i++)
                            {
                                var columnName = $"recommended_show_{i}_id";
                                if (!reader.IsDBNull(reader.GetOrdinal(columnName)))
                                {
                                    result.Add(reader.GetString(reader.GetOrdinal(columnName)));
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }

        public async Task<CarouselsResponseDto?> GetCarouselsWithUserInfoAsync(int userId)
        {
            var user = await _context.movies_users.FindAsync(userId);
            if (user == null) return null;

            var ratedShowIds = await _context.movies_ratings
                .Where(r => r.UserId == userId)
                .Select(r => r.ShowId)
                .ToListAsync();

            var highRatedShows = await _context.movies_ratings
                .Where(r => r.UserId == userId && r.Rating >= 4)
                .Select(r => r.ShowId)
                .ToListAsync();

            var titlesDict = await _context.movies_titles.ToDictionaryAsync(t => t.show_id);

            List<CarouselItemDto> MapShowIds(IEnumerable<string> showIds)
            {
                return showIds.Where(id => titlesDict.ContainsKey(id))
                    .Select(id => new CarouselItemDto
                    {
                        ShowId = id,
                        Title = titlesDict[id].title,
                        Description = titlesDict[id].description
                    }).ToList();
            }

            var carousels = new List<CarouselDto>();

            var allRecs = await GetRecommendationShowIds($"SELECT * FROM user_recommendations_all WHERE user_id = {userId}");
            if (allRecs.Count > 0)
            {
                carousels.Add(new CarouselDto { Title = "Recommended for You", Items = MapShowIds(allRecs) });
            }

            if (!string.IsNullOrEmpty(user.FavoriteMovie) && titlesDict.ContainsKey(user.FavoriteMovie))
            {
                var favMovieRecs = await GetRecommendationShowIds($"SELECT * FROM show_recommendations WHERE show_id = '{user.FavoriteMovie}'");
                if (favMovieRecs.Count > 0)
                {
                    carousels.Add(new CarouselDto
                    {
                        Title = $"{titlesDict[user.FavoriteMovie].title} Lovers also Loved...",
                        Items = MapShowIds(favMovieRecs)
                    });
                }
            }

            foreach (var showId in highRatedShows)
            {
                if (!titlesDict.ContainsKey(showId)) continue;
                var row = await GetRecommendationShowIds($"SELECT * FROM show_recommendations WHERE show_id = '{showId}'");
                if (row.Count > 0)
                {
                    carousels.Add(new CarouselDto
                    {
                        Title = $"Because you liked {titlesDict[showId].title}",
                        Items = MapShowIds(row)
                    });
                }
            }

            var categories = new[] { "Action", "Adventure", "AnimeSeries", "BritishSeries", "Children", "Comedies", "InternationalComedyDramas", "InternationalComedies", "RomanticComedies", "CrimeTVShowsDocuseries", "Documentaries", "InternationalDocumentaries", "Docuseries", "Dramas", "InternationalDramas", "RomanticDramas", "Family", "Fantasy", "Horror", "InternationalThrillers", "InternationalTVRomanticDramas", "Kids", "Language", "Musicals", "NatureTV", "RealityTV", "Spirituality", "ActionTV", "ComedyTV", "DramaTV", "TalkShowTVComedies", "Thrillers" };

            foreach (var category in categories)
            {
                var prop = typeof(Movie_Users).GetProperty(category);
                if (prop != null && prop.PropertyType == typeof(bool) && (bool)(prop.GetValue(user) ?? false))
                {
                    var catRecs = await GetRecommendationShowIds($"SELECT * FROM user_recommendations_{category.ToLower()} WHERE user_id = {userId}");
                    if (catRecs.Count > 0)
                    {
                        carousels.Add(new CarouselDto
                        {
                            Title = $"{category} Movies You Might Like",
                            Items = MapShowIds(catRecs)
                        });
                    }
                }
            }

            var services = new[] { "Netflix", "Amazon Prime", "Disney+", "Paramount+", "Max", "Hulu", "Apple TV+", "Peacock" };

            foreach (var service in services)
            {
                var prop = typeof(Movie_Users).GetProperty(service.Replace(" ", "").Replace("+", "Plus"));
                if (prop != null && prop.PropertyType == typeof(bool) && (bool)(prop.GetValue(user) ?? false))
                {
                    var streamRecs = await GetRecommendationShowIds($"SELECT * FROM show_recommendations_streaming WHERE streaming_service = '{service}'");
                    if (streamRecs.Count > 0)
                    {
                        carousels.Add(new CarouselDto
                        {
                            Title = $"Other {service} Watchers Enjoyed",
                            Items = MapShowIds(streamRecs)
                        });
                    }
                }
            }

            var allShows = titlesDict.Keys
                .Where(k => !ratedShowIds.Contains(k))
                .OrderBy(_ => Guid.NewGuid())
                .Take(20);
            carousels.Add(new CarouselDto
            {
                Title = "Try a Random Movie",
                Items = MapShowIds(allShows)
            });

            return new CarouselsResponseDto
            {
                Name = user.Name,
                Carousels = carousels
            };
        }
    }
}
