using MovieINTEX.Data;
using MovieINTEX.Models.Dto;

namespace MovieINTEX.Services
{
    public interface IRecommendationService
    {
        List<MovieDto> SearchMovies(string query);

        List<MovieDto> GetAllMovies();

        List<Movie_Titles> GetPagedMovies(int page, int pageSize);

        int GetTotalMovieCount();

        List<string> GetAllMovieCategories();
        Task<List<CarouselDto>> GetCarouselsForUserAsync(int userId);


        Movie_Titles AddMovie(Movie_Titles movie);

        Movie_Titles? UpdateMovie(string id, Movie_Titles movie);

        bool DeleteMovie(string id);
    }
}
