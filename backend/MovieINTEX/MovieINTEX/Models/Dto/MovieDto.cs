namespace MovieINTEX.Models.Dto
{
    // MovieDto.cs
    public class MovieDto
    {
        public string ShowId { get; set; }  // ⬅️ string instead of int
        public string Title { get; set; }
        public int? ReleaseYear { get; set; }
        public string? Description { get; set; }
    }



}
