using System.Text.Json.Serialization;

namespace MovieINTEX.Models.Dto
{
    // MovieDto.cs
    public class MovieDto
    {
        [JsonPropertyName("show_id")]
        public string ShowId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("release_year")]
        public int? ReleaseYear { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("director")]
        public string? Director { get; set; }

        [JsonPropertyName("rating")]
        public string? Rating { get; set; }

        [JsonPropertyName("duration")]
        public string? Duration { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("cast")]
        public string? Cast { get; set; }

        [JsonPropertyName("country")]
        public string? Country { get; set; }
    }




}
