using MovieINTEX.Models.Dto;

namespace MovieINTEX.Services
{

    public interface IRecommendationService
    {
        List<MovieDto> SearchMovies(string query);

        List<MovieDto> GetAllMovies();

        List<string> GetAllMovieCategories();

    }

}
