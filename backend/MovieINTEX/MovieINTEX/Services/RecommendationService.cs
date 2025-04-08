using MovieINTEX.Data;
using MovieINTEX.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
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

    }
}
