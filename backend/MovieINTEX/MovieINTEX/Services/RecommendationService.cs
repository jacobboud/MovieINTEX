using MovieINTEX.Data;
using MovieINTEX.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;
using System.Globalization;
using System.Text;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NuGet.Packaging.Signing;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System;

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

        public int GetTotalMovieCount()
        {
            return _context.movies_titles.Count();
        }

        public List<Movie_Titles> GetPagedMovies(int page, int pageSize)
        {
            return _context.movies_titles
                .OrderBy(m => m.title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new Movie_Titles
                {
                    show_id = m.show_id,
                    title = m.title,
                    release_year = m.release_year,
                    description = m.description
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

<<<<<<< HEAD
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
=======
        public Movie_Titles AddMovie(Movie_Titles movie)
        {
            // Generate the next show_id by finding the max existing show_id in the database
            var maxShowId = _context.movies_titles
                .Where(m => m.show_id.StartsWith("s")) // Only consider show_ids starting with "S"
                .Select(m => m.show_id)
                .OrderByDescending(s => s)
                .FirstOrDefault();

            // If no movies exist, start from "S1"
            int nextId = 1;
            if (!string.IsNullOrEmpty(maxShowId))
            {
                // Extract the numeric part of the show_id, assuming it's in the form "S123"
                var numericPart = maxShowId.Substring(1); // Remove the "S" prefix
                if (int.TryParse(numericPart, out int currentId))
                {
                    nextId = currentId + 1; // Increment the ID
                }
            }

            // Assign the new show_id (e.g., "S123")
            movie.show_id = "s" + nextId;

            // Map the incoming movie data to the Movie_Titles entity
            var entity = new Movie_Titles
            {
                show_id = movie.show_id,  // Explicitly set the show_id here
                title = movie.title,
                release_year = movie.release_year,
                description = movie.description,
                director = movie.director,
                cast = movie.cast,
                country = movie.country,
                rating = movie.rating,
                duration = movie.duration,
                type = movie.type,
                Action = movie.Action,
                Adventure = movie.Adventure,
                AnimeSeries = movie.AnimeSeries,
                BritishSeries = movie.BritishSeries,
                Children = movie.Children,
                Comedies = movie.Comedies,
                InternationalComedyDramas = movie.InternationalComedyDramas,
                InternationalComedies = movie.InternationalComedies,
                RomanticComedies = movie.RomanticComedies,
                CrimeTVShowsDocuseries = movie.CrimeTVShowsDocuseries,
                Documentaries = movie.Documentaries,
                InternationalDocumentaries = movie.InternationalDocumentaries,
                Docuseries = movie.Docuseries,
                Dramas = movie.Dramas,
                InternationalDramas = movie.InternationalDramas,
                RomanticDramas = movie.RomanticDramas,
                Family = movie.Family,
                Fantasy = movie.Fantasy,
                Horror = movie.Horror,
                InternationalThrillers = movie.InternationalThrillers,
                InternationalTVRomanticDramas = movie.InternationalTVRomanticDramas,
                Kids = movie.Kids,
                Language = movie.Language,
                Musicals = movie.Musicals,
                NatureTV = movie.NatureTV,
                RealityTV = movie.RealityTV,
                Spirituality = movie.Spirituality,
                ActionTV = movie.ActionTV,
                ComedyTV = movie.ComedyTV,
                DramaTV = movie.DramaTV,
                TalkShowTVComedies = movie.TalkShowTVComedies,
                Thrillers = movie.Thrillers
            };

            // Save the movie entity to the database
            _context.movies_titles.Add(entity);
            _context.SaveChanges();

            // Return the added movie (with show_id now populated)
            movie.show_id = entity.show_id;
            return movie; // Return 200 OK with the added movie
        }


        public Movie_Titles? UpdateMovie(string id, Movie_Titles movie)
        {
            var existing = _context.movies_titles.FirstOrDefault(m => m.show_id == id);
            if (existing == null)
                return null;

            existing.title = movie.title;
            existing.release_year = movie.release_year;
            existing.description = movie.description;
            existing.director = movie.director;
            existing.cast = movie.cast;
            existing.country = movie.country;
            existing.rating = movie.rating;
            existing.duration = movie.duration;
            existing.type = movie.type;
            // Update genres here too if applicable
            // Genre flags (mapping directly)
            existing.Action = movie.Action;
            existing.Adventure = movie.Adventure;
            existing.AnimeSeries = movie.AnimeSeries;
            existing.BritishSeries = movie.BritishSeries;
            existing.Children = movie.Children;
            existing.Comedies = movie.Comedies;
            existing.InternationalComedyDramas = movie.InternationalComedyDramas;
            existing.InternationalComedies = movie.InternationalComedies;
            existing.RomanticComedies = movie.RomanticComedies;
            existing.CrimeTVShowsDocuseries = movie.CrimeTVShowsDocuseries;
            existing.Documentaries = movie.Documentaries;
            existing.InternationalDocumentaries = movie.InternationalDocumentaries;
            existing.Docuseries = movie.Docuseries;
            existing.Dramas = movie.Dramas;
            existing.InternationalDramas = movie.InternationalDramas;
            existing.RomanticDramas = movie.RomanticDramas;
            existing.Family = movie.Family;
            existing.Fantasy = movie.Fantasy;
            existing.Horror = movie.Horror;
            existing.InternationalThrillers = movie.InternationalThrillers;
            existing.InternationalTVRomanticDramas = movie.InternationalTVRomanticDramas;
            existing.Kids = movie.Kids;
            existing.Language = movie.Language;
            existing.Musicals = movie.Musicals;
            existing.NatureTV = movie.NatureTV;
            existing.RealityTV = movie.RealityTV;
            existing.Spirituality = movie.Spirituality;
            existing.ActionTV = movie.ActionTV;
            existing.ComedyTV = movie.ComedyTV;
            existing.DramaTV = movie.DramaTV;
            existing.TalkShowTVComedies = movie.TalkShowTVComedies;
            existing.Thrillers = movie.Thrillers;

            _context.SaveChanges();

            return movie;
        }

        public bool DeleteMovie(string id)
        {
            var movie = _context.movies_titles.FirstOrDefault(m => m.show_id == id);
            if (movie == null)
                return false;

            _context.movies_titles.Remove(movie);
            _context.SaveChanges();
            return true;
        }

        public async Task<List<CarouselDto>> GetCarouselsForUserAsync(int userId)
>>>>>>> 7e5095a0dd4dd696147ff65279ef8e4b0766711a
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
