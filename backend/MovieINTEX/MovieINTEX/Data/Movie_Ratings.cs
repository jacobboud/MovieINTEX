using System.ComponentModel.DataAnnotations;

namespace MovieINTEX.Data
{
    public class MovieRating
    {
        [Key]
        public int UserId { get; set; }
        public int ShowId { get; set; }
        public int Rating { get; set; }
    }
}
