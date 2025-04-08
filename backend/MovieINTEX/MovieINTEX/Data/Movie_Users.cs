using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieINTEX.Data
{
    public class Movie_Users
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        public required string Name { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public int Age { get; set; }
        public required string Gender { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }
        public required string Zip { get; set; }

        public bool Netflix { get; set; }

        [Column("Amazon Prime")]
        public bool AmazonPrime { get; set; }

        [Column("Disney+")]
        public bool DisneyPlus { get; set; }

        [Column("Paramount+")]
        public bool ParamountPlus { get; set; }

        [Column("Max")]
        public bool Max { get; set; }

        public bool Hulu { get; set; }

        [Column("Apple TV+")]
        public bool AppleTVPlus { get; set; }

        public bool Peacock { get; set; }

        public string IdentityUserId { get; set; }
    }
}