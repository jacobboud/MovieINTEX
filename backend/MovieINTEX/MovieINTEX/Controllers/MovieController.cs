﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieINTEX.Data;
using MovieINTEX.Services;

namespace MovieINTEX.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public MovieController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpGet("movies")]
        public IActionResult GetMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length > 100)
                return BadRequest("Invalid movie name query.");

            var results = _recommendationService.SearchMovies(query);
            return Ok(results);
        }


        [HttpGet("all-movies")]
        public IActionResult GetAllMovies()
        {
            var results = _recommendationService.GetAllMovies();
            return Ok(results);
        }

        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = _recommendationService.GetAllMovieCategories();
            return Ok(categories);

        }



    }
}
