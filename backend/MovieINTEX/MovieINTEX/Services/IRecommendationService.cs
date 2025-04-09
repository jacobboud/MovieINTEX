using MovieINTEX.Data;
using MovieINTEX.Models.Dto;

namespace MovieINTEX.Services
{
    public interface IRecommendationService
    {
        //Search for movies by title
        List<MovieDto> SearchMovies(string query);

        //Get all movies (non-paginated)
        List<MovieDto> GetAllMovies();

        //Get filtered, sorted, paginated movie results
        List<MovieDto> GetPagedMovies(int page, int pageSize, string? category = null, string? sortBy = "NameAsc");

        //Get count of movies based on optional category
        int GetTotalMovieCount(string? category = null);

        //Return a list of all category fields (from bool properties)
        List<string> GetAllMovieCategories();

        //Get personalized carousels based on user info
        Task<CarouselsResponseDto?> GetCarouselsWithUserInfoAsync(int userId);

        //Add a new movie
        Movie_Titles AddMovie(Movie_Titles movie);

        // Update an existing movie
        Movie_Titles? UpdateMovie(string id, Movie_Titles movie);

        //Delete a movie by ID
        bool DeleteMovie(string id);

        Task<List<string>> GetRecommendationsForShowAsync(string showId);

    }
}