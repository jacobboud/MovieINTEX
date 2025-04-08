﻿using MovieINTEX.Models.Dto;

namespace MovieINTEX.Services
{

    public interface IRecommendationService
    {
        List<MovieDto> SearchMovies(string query);
        List<string> GetAllMovieCategories();

    }

}
