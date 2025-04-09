using System.Text.Json.Serialization;

namespace MovieINTEX.Models.Dto
{
    // MovieDto.cs
    public class MovieDto
    {
        [JsonPropertyName("show_id")]
        public string ShowId { get; set; }
        public string Title { get; set; }
        public int? ReleaseYear { get; set; }
        public string? Description { get; set; }

        public string? Director { get; set; }
        public string? Rating { get; set; }
        public string? Duration { get; set; }
        public string? Type { get; set; }
        public string? Cast { get; set; }
        public string? Country { get; set; }
    }




}
