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

        private static readonly Dictionary<string, string> CategoryTableMapping = new()
        {
            ["AnimeSeries"] = "user_recommendations_anime_series_international_tv_shows",
            ["BritishSeries"] = "user_recommendations_british_tv_shows_docuseries_international_tv_shows",
            ["Comedies"] = "user_recommendations_comedies",
            ["Children"] = "user_recommendations_children",
            ["CrimeTVShowsDocuseries"] = "user_recommendations_crime_tv_shows_docuseries",
            ["Documentaries"] = "user_recommendations_documentaries",
            ["Docuseries"] = "user_recommendations_docuseries",
            ["Dramas"] = "user_recommendations_dramas",
            ["Fantasy"] = "user_recommendations_fantasy",
            ["Family"] = "user_recommendations_family_movies",
            ["Horror"] = "user_recommendations_horror_movies",
            ["InternationalComedies"] = "user_recommendations_comedies_international_movies",
            ["InternationalComedyDramas"] = "user_recommendations_comedies_dramas_international_movies",
            ["InternationalDocumentaries"] = "user_recommendations_documentaries_international_movies",
            ["InternationalDramas"] = "user_recommendations_dramas_international_movies",
            ["InternationalTVRomanticDramas"] = "user_recommendations_international_tv_shows_romantic_tv_shows_tv_dramas",
            ["InternationalThrillers"] = "user_recommendations_international_movies_thrillers",
            ["Kids"] = "user_recommendations_kids'_tv",
            ["Language"] = "user_recommendations_language_tv_shows",
            ["Musicals"] = "user_recommendations_musicals",
            ["NatureTV"] = "user_recommendations_nature_tv",
            ["RealityTV"] = "user_recommendations_reality_tv",
            ["RomanticComedies"] = "user_recommendations_comedies_romantic_movies",
            ["RomanticDramas"] = "user_recommendations_dramas_romantic_movies",
            ["Spirituality"] = "user_recommendations_spirituality",
            ["TalkShowTVComedies"] = "user_recommendations_talk_shows_tv_comedies",
            ["Thrillers"] = "user_recommendations_thrillers",
            ["Action"] = "user_recommendations_action",
            ["ActionTV"] = "user_recommendations_tv_action",
            ["Adventure"] = "user_recommendations_adventure",
            ["ComedyTV"] = "user_recommendations_tv_comedies",
            ["DramaTV"] = "user_recommendations_tv_dramas"
        };


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

        public int GetTotalMovieCount(string? category = null)
        {
            var query = _context.movies_titles.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(m => EF.Property<bool>(m, category) == true);
            }

            return query.Count();
        }

        public List<MovieDto> GetPagedMovies(int page, int pageSize, string? category = null, string? sortBy = "NameAsc")
        {
            var query = _context.movies_titles.AsQueryable();

            // Category filtering
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(m => EF.Property<bool>(m, category) == true);
            }

            // Sorting logic
            query = sortBy switch
            {
                "NameDesc" => query.OrderByDescending(m => m.title),
                "NotRated" => query
                    .Where(m => !_context.movies_ratings.Any(r => r.ShowId == m.show_id))
                    .OrderBy(m => m.title),
                "RatingHigh" => query
                    .OrderByDescending(m => _context.movies_ratings
                        .Where(r => r.ShowId == m.show_id)
                        .Average(r => (double?)r.Rating) ?? 0),
                "RatingLow" => query
                    .OrderBy(m => _context.movies_ratings
                        .Where(r => r.ShowId == m.show_id)
                        .Average(r => (double?)r.Rating) ?? double.MaxValue),
                _ => query.OrderBy(m => m.title)
            };


            // Pagination and projection
            return query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
                            for (int i = 1; i <= 20; i++)
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
                var favEntry = titlesDict[user.FavoriteMovie];
                var safeShowId = user.FavoriteMovie.Replace("'", "''");
                var favMovieRecs = await GetRecommendationShowIds($"SELECT * FROM show_recommendations WHERE show_id = '{safeShowId}'");

                Console.WriteLine($"[FavoriteMovie] show_id: {safeShowId}, title: {favEntry.title}, recs: {favMovieRecs.Count}");

                if (favMovieRecs.Count > 0)
                {
                    carousels.Add(new CarouselDto
                    {
                        Title = $"\"{favEntry.title}\" Lovers also Loved",
                        Items = MapShowIds(favMovieRecs)
                    });
                }
            }

            // 3. Because you liked {Movie}
            foreach (var showId in highRatedShows)
            {
                // Skip if this is also the favorite movie
                if (user.FavoriteMovie == showId)
                    continue;

                if (!titlesDict.ContainsKey(showId))
                {
                    Console.WriteLine($"[HighRated] show_id not found in titlesDict: {showId}");
                    continue;
                }

                Console.WriteLine($"[HighRated] Trying recommendations for show_id: {showId}, title: {titlesDict[showId].title}");
                var safeShowId = showId.Replace("'", "''");
                var row = await GetRecommendationShowIds($"SELECT * FROM show_recommendations WHERE show_id = '{safeShowId}'");

                Console.WriteLine($"[HighRated] Found {row.Count} recommendations for {titlesDict[showId].title}");

                if (row.Count > 0)
                {
                    carousels.Add(new CarouselDto
                    {
                        Title = $"If You Like \"{titlesDict[showId].title}\"",
                        Items = MapShowIds(row)
                    });
                }
            }


            // 4. {Category} Movies You Might Like
            var categories = new[] {
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
                    if (CategoryTableMapping.TryGetValue(category, out var tableName))
                    {
                        var catRecs = await GetRecommendationShowIds($"SELECT * FROM {tableName} WHERE user_id = {userId}");
                        if (catRecs.Count > 0)
                        {
                            carousels.Add(new CarouselDto
                            {
                                Title = $"Movies You Might Like - {category}",
                                Items = MapShowIds(catRecs)
                            });
                        }
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

        public Task<List<string>> GetRecommendationsForShowAsync(string showId)
        {
            var safeShowId = showId.Replace("'", "''");
            string sql = $"SELECT * FROM show_recommendations WHERE show_id = '{safeShowId}'";
            return GetRecommendationShowIds(sql);
        }


    }
}
