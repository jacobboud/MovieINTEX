using MovieINTEX.Data;
using MovieINTEX.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;

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
                    Description = m.description,
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

        public int GetTotalMovieCount(string? category = null, string? sortBy = null)
        {
            var query = _context.movies_titles.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(m => EF.Property<bool>(m, category) == true);
            }

            if (sortBy == "NotRated")
            {
                query = query.Where(m => !_context.movies_ratings.Any(r => r.ShowId == m.show_id));
            }

            return query.Count();
        }

        public List<Movie_Titles> GetPagedMovies(int page, int pageSize, string? sortBy = null, string? category = null)
        {
            var query = _context.movies_titles.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(m => EF.Property<bool>(m, category) == true);
            }

            switch (sortBy)
            {
                case "NameDesc":
                    query = query.OrderByDescending(m => m.title);
                    break;
                case "NotRated":
                    query = query
                        .Where(m => !_context.movies_ratings.Any(r => r.ShowId == m.show_id))
                        .OrderBy(m => m.title);
                    break;
                default:
                    query = query.OrderBy(m => m.title); // Name A–Z
                    break;
            }

            return query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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

        public Movie_Titles AddMovie(Movie_Titles movie)
        {
            var maxShowId = _context.movies_titles
                .Where(m => m.show_id.StartsWith("s"))
                .Select(m => m.show_id)
                .OrderByDescending(s => s)
                .FirstOrDefault();

            int nextId = 1;
            if (!string.IsNullOrEmpty(maxShowId))
            {
                var numericPart = maxShowId.Substring(1);
                if (int.TryParse(numericPart, out int currentId))
                {
                    nextId = currentId + 1;
                }
            }

            movie.show_id = "s" + nextId;
            _context.movies_titles.Add(movie);
            _context.SaveChanges();
            return movie;
        }

        public Movie_Titles? UpdateMovie(string id, Movie_Titles movie)
        {
            var existing = _context.movies_titles.FirstOrDefault(m => m.show_id == id);
            if (existing == null) return null;

            _context.Entry(existing).CurrentValues.SetValues(movie);
            _context.SaveChanges();
            return movie;
        }

        public bool DeleteMovie(string id)
        {
            var movie = _context.movies_titles.FirstOrDefault(m => m.show_id == id);
            if (movie == null) return false;

            _context.movies_titles.Remove(movie);
            _context.SaveChanges();
            return true;
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
                return showIds
                    .Where(id => titlesDict.ContainsKey(id))
                    .Select(id => new CarouselItemDto
                    {
                        ShowId = id,
                        Title = titlesDict[id].title,
                        Description = titlesDict[id].description
                    }).ToList();
            }

            var carousels = new List<CarouselDto>();

            // 1. Recommended for You
            var allRecs = await GetRecommendationShowIds($"SELECT * FROM user_recommendations_all WHERE user_id = {userId}");
            if (allRecs.Count > 0)
            {
                carousels.Add(new CarouselDto { Title = "Recommended for You", Items = MapShowIds(allRecs) });
            }

            // 2. {Favorite Movie} Lovers Also Loved
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

            // 3. Because you liked {Movie}
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

            // 4. {Category} Movies You Might Like
            var categories = new[]
            {
                "Action", "Adventure", "AnimeSeries", "BritishSeries", "Children", "Comedies",
                "InternationalComedyDramas", "InternationalComedies", "RomanticComedies", "CrimeTVShowsDocuseries",
                "Documentaries", "InternationalDocumentaries", "Docuseries", "Dramas", "InternationalDramas",
                "RomanticDramas", "Family", "Fantasy", "Horror", "InternationalThrillers",
                "InternationalTVRomanticDramas", "Kids", "Language", "Musicals", "NatureTV", "RealityTV",
                "Spirituality", "ActionTV", "ComedyTV", "DramaTV", "TalkShowTVComedies", "Thrillers"
            };

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

            // 5. Other {Streaming Service} Watchers Enjoyed
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

            // 6. Try a Random Movie
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
