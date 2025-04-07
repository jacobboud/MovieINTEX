using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;

namespace WaterProject.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly MovieDbContext _movieContext;

        public MovieController(MovieDbContext context)
        {
            _movieContext = context;
        }

        // GET: /Movie/AllMovies
        [HttpGet("AllMovies")]
        public IActionResult GetMovies(int pageSize = 10, int pageNum = 1, [FromQuery] List<string>? genres = null)
        {
            var query = _movieContext.movies_titles.AsQueryable();

            // Dynamically filter by genres if provided
            if (genres != null && genres.Any())
            {
                foreach (var genre in genres)
                {
                    // Normalize the genre string and map it to the corresponding boolean property
                    switch (genre.ToLower())
                    {
                        case "action":
                            query = query.Where(m => m.Action);
                            break;
                        case "adventure":
                            query = query.Where(m => m.Adventure);
                            break;
                        case "anime series":
                            query = query.Where(m => m.AnimeSeries);
                            break;
                        case "british tv shows docuseries international tv shows":
                            query = query.Where(m => m.BritishSeries);
                            break;
                        case "children":
                            query = query.Where(m => m.Children);
                            break;
                        case "comedies":
                            query = query.Where(m => m.Comedies);
                            break;
                        case "international comedy dramas":
                            query = query.Where(m => m.InternationalComedyDramas);
                            break;
                        case "international comedies":
                            query = query.Where(m => m.InternationalComedies);
                            break;
                        case "romantic comedies":
                            query = query.Where(m => m.RomanticComedies);
                            break;
                        case "crime tv shows docuseries":
                            query = query.Where(m => m.CrimeTVShowsDocuseries);
                            break;
                        case "documentaries":
                            query = query.Where(m => m.Documentaries);
                            break;
                        case "international documentaries":
                            query = query.Where(m => m.InternationalDocumentaries);
                            break;
                        case "docuseries":
                            query = query.Where(m => m.Docuseries);
                            break;
                        case "dramas":
                            query = query.Where(m => m.Dramas);
                            break;
                        case "international dramas":
                            query = query.Where(m => m.InternationalDramas);
                            break;
                        case "romantic dramas":
                            query = query.Where(m => m.RomanticDramas);
                            break;
                        case "family":
                            query = query.Where(m => m.Family);
                            break;
                        case "fantasy":
                            query = query.Where(m => m.Fantasy);
                            break;
                        case "horror":
                            query = query.Where(m => m.Horror);
                            break;
                        case "international thrillers":
                            query = query.Where(m => m.InternationalThrillers);
                            break;
                        case "international tv shows romantic tv shows tv dramas":
                            query = query.Where(m => m.InternationalTVRomanticDramas);
                            break;
                        case "kids":
                            query = query.Where(m => m.Kids);
                            break;
                        case "language":
                            query = query.Where(m => m.Language);
                            break;
                        case "musicals":
                            query = query.Where(m => m.Musicals);
                            break;
                        case "nature tv":
                            query = query.Where(m => m.NatureTV);
                            break;
                        case "reality tv":
                            query = query.Where(m => m.RealityTV);
                            break;
                        case "spirituality":
                            query = query.Where(m => m.Spirituality);
                            break;
                        case "action tv":
                            query = query.Where(m => m.ActionTV);
                            break;
                        case "comedy tv":
                            query = query.Where(m => m.ComedyTV);
                            break;
                        case "drama tv":
                            query = query.Where(m => m.DramaTV);
                            break;
                        case "talk show tv comedies":
                            query = query.Where(m => m.TalkShowTVComedies);
                            break;
                        case "thrillers":
                            query = query.Where(m => m.Thrillers);
                            break;
                        default:
                            return BadRequest(new { message = $"Invalid genre: {genre}" });
                    }
                }
            }

            var totalMovies = query.Count();

            var movies = query.Skip((pageNum - 1) * pageSize).Take(pageSize).ToList();

            var responseObject = new
            {
                Movies = movies,
                TotalMovies = totalMovies
            };

            return Ok(responseObject);
        }

        // GET: /Movie/GetAllGenres
        [HttpGet("GetAllGenres")]
        public IActionResult GetAllGenres()
        {
            // Return all the possible genre names (just for reference or UI rendering)
            var genres = new List<string>
            {
                "Action", "Adventure", "Anime Series", "British TV Shows Docuseries International TV Shows", "Children", "Comedies",
                "International Comedy Dramas", "International Comedies", "Romantic Comedies", "Crime TV Shows Docuseries", "Documentaries",
                "International Documentaries", "Docuseries", "Dramas", "International Dramas", "Romantic Dramas", "Family", "Fantasy",
                "Horror", "International Thrillers", "International TV Shows Romantic TV Shows TV Dramas", "Kids", "Language", "Musicals",
                "Nature TV", "Reality TV", "Spirituality", "Action TV", "Comedy TV", "Drama TV", "Talk Shows TV Comedies", "Thrillers"
            };

            return Ok(genres);
        }

        // POST: /Movie/AddMovie
        [HttpPost("AddMovie")]
        public IActionResult AddMovie([FromBody] Movie_Titles newMovie)
        {
            if (newMovie == null)
            {
                return BadRequest("Invalid movie data.");
            }

            _movieContext.movies_titles.Add(newMovie);
            _movieContext.SaveChanges();

            return Ok(newMovie);
        }

        // PUT: /Movie/UpdateMovie/{showId}
        [HttpPut("UpdateMovie/{showId}")]
        public IActionResult UpdateMovie(int showId, [FromBody] Movie_Titles updatedMovie)
        {
            var existingMovie = _movieContext.movies_titles.Find(showId);

            if (existingMovie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            existingMovie.title = updatedMovie.title;
            existingMovie.type = updatedMovie.type;
            existingMovie.director = updatedMovie.director;
            existingMovie.cast = updatedMovie.cast;
            existingMovie.country = updatedMovie.country;
            existingMovie.release_year = updatedMovie.release_year;
            existingMovie.rating = updatedMovie.rating;
            existingMovie.duration = updatedMovie.duration;
            existingMovie.description = updatedMovie.description;

            // Update the genre fields as well
            existingMovie.Action = updatedMovie.Action;
            existingMovie.Adventure = updatedMovie.Adventure;
            existingMovie.AnimeSeries = updatedMovie.AnimeSeries;
            existingMovie.BritishSeries = updatedMovie.BritishSeries;
            existingMovie.Children = updatedMovie.Children;
            existingMovie.Comedies = updatedMovie.Comedies;
            existingMovie.InternationalComedyDramas = updatedMovie.InternationalComedyDramas;
            existingMovie.InternationalComedies = updatedMovie.InternationalComedies;
            existingMovie.RomanticComedies = updatedMovie.RomanticComedies;
            existingMovie.CrimeTVShowsDocuseries = updatedMovie.CrimeTVShowsDocuseries;
            existingMovie.Documentaries = updatedMovie.Documentaries;
            existingMovie.InternationalDocumentaries = updatedMovie.InternationalDocumentaries;
            existingMovie.Docuseries = updatedMovie.Docuseries;
            existingMovie.Dramas = updatedMovie.Dramas;
            existingMovie.InternationalDramas = updatedMovie.InternationalDramas;
            existingMovie.RomanticDramas = updatedMovie.RomanticDramas;
            existingMovie.Family = updatedMovie.Family;
            existingMovie.Fantasy = updatedMovie.Fantasy;
            existingMovie.Horror = updatedMovie.Horror;
            existingMovie.InternationalThrillers = updatedMovie.InternationalThrillers;
            existingMovie.InternationalTVRomanticDramas = updatedMovie.InternationalTVRomanticDramas;
            existingMovie.Kids = updatedMovie.Kids;
            existingMovie.Language = updatedMovie.Language;
            existingMovie.Musicals = updatedMovie.Musicals;
            existingMovie.NatureTV = updatedMovie.NatureTV;
            existingMovie.RealityTV = updatedMovie.RealityTV;
            existingMovie.Spirituality = updatedMovie.Spirituality;
            existingMovie.ActionTV = updatedMovie.ActionTV;
            existingMovie.ComedyTV = updatedMovie.ComedyTV;
            existingMovie.DramaTV = updatedMovie.DramaTV;
            existingMovie.TalkShowTVComedies = updatedMovie.TalkShowTVComedies;
            existingMovie.Thrillers = updatedMovie.Thrillers;

            _movieContext.movies_titles.Update(existingMovie);
            _movieContext.SaveChanges();

            return Ok(existingMovie);
        }

        // DELETE: /Movie/DeleteMovie/{showId}
        [HttpDelete("DeleteMovie/{showId}")]
        public IActionResult DeleteMovie(int showId)
        {
            var movie = _movieContext.movies_titles.Find(showId);

            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            _movieContext.movies_titles.Remove(movie);
            _movieContext.SaveChanges();

            return Ok(new { message = "Movie deleted successfully" });
        }
    }
}
